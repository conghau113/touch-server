const UserModel = require('../models/UserModel.js');
const PostModel = require('../models/PostModel.js');
const PostLike = require('../models/PostLike.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const FollowModel = require('../models/FollowModel.js');
const { default: mongoose } = require('mongoose');

const options = { new: true, runValidators: true };

const getUserDict = (token, user) => {
  return {
    token,
    username: user.username,
    userId: user._id,
    isAdmin: user.isAdmin,
  };
};

const buildToken = (user) => {
  return {
    userId: user._id,
    isAdmin: user.isAdmin,
  };
};

const updateDP = async (req, res) => {
  const image = req.files?.image;
  if (!image) throw new BadRequestError('Expected an image');
  const { secure_url: profileImage } = await uploadImage(image);
  const { id } = req.user;
  const user = await UserModel.findByIdAndUpdate(id, { profileImage }, options).select({ password: 0 });
  if (!user) throw new NotFoundError(`No user exist with id ${id}`);
  await PostModel.updateMany({ createdBy: id }, { userDetails: { name: user.name, image: profileImage } });
  res.status(StatusCodes.OK).json({ user });
};

const register = async (req, res) => {
  try {
    const { username, email, password, fullName, location, occupation } = req.body;
    console.log('req.body::,', req.body);
    if (!(username && email && password && fullName && location && occupation)) {
      throw new Error('All input required');
    }

    const normalizedEmail = email.toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await UserModel.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

    if (existingUser) {
      throw new Error('Email and username must be unique');
    }

    const user = await UserModel.create({
      username,
      fullName,
      location,
      occupation,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(buildToken(user), process.env.TOKEN_KEY);

    return res.json(getUserDict(token, user));
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      throw new Error('All input required');
    }

    const normalizedEmail = email.toLowerCase();

    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      throw new Error('Email or password incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Email or password incorrect');
    }

    const token = jwt.sign(buildToken(user), process.env.TOKEN_KEY);

    return res.json(getUserDict(token, user));
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId, biography, fullName, location, occupation, username } = req.body;
    const avatar = req.body ?? {};
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error('User does not exist');
    }
    console.log('req.body::', req.body);
    if (avatar) {
      user.avatar = avatar;
    } else {
      if (typeof biography == 'string') {
        user.biography = biography;
      }
      user.fullName = fullName;
      user.location = location;
      user.occupation = occupation;
      user.username = username;
    }

    await user.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const follow = async (req, res) => {
  try {
    const followingId = req.params.id;
    const { userId } = req.body;
    console.log('followingId', followingId);
    console.log('userId', userId);

    const existingFollow = await FollowModel.find({ userId, followingId });

    if (existingFollow) {
      throw new Error('Already following this user');
    }

    const follow = await FollowModel.create({ userId, followingId });

    return res.status(200).json({ data: follow });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const unfollow = async (req, res) => {
  try {
    const followingId = req.params.id;
    const { userId } = req.body;

    const existingFollow = await FollowModel.find({ userId, followingId });

    if (!existingFollow) {
      throw new Error('Not already following user');
    }

    await existingFollow.remove();

    return res.status(200).json({ data: existingFollow });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    const followers = await FollowModel.find({ followingId: userId });

    return res.status(200).json({ data: followers });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    const following = await FollowModel.find({ userId });

    return res.status(200).json({ data: following });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const username = req.params.username;

    const user = await UserModel.findOne({ username }).select('-password');

    if (!user) {
      throw new Error('User does not exist');
    }

    const posts = await PostModel.find({ poster: user._id }).populate('poster').sort('-createdAt');

    let likeCount = 0;

    posts.forEach((post) => {
      likeCount += post.likeCount;
    });

    const data = {
      user,
      posts: {
        count: posts.length,
        likeCount,
        data: posts,
      },
    };

    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getRandomUsers = async (req, res) => {
  try {
    let { size } = req.query;

    const users = await UserModel.find().select('-password');

    const randomUsers = [];

    if (size > users.length) {
      size = users.length;
    }

    const randomIndices = getRandomIndices(size, users.length);

    for (let i = 0; i < randomIndices.length; i++) {
      const randomUser = users[randomIndices[i]];
      randomUsers.push(randomUser);
    }

    return res.status(200).json(randomUsers);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
};

const getRandomIndices = (size, sourceSize) => {
  const randomIndices = [];
  while (randomIndices.length < size) {
    const randomNumber = Math.floor(Math.random() * sourceSize);
    if (!randomIndices.includes(randomNumber)) {
      randomIndices.push(randomNumber);
    }
  }
  return randomIndices;
};

module.exports = {
  register,
  login,
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  getUser,
  getRandomUsers,
  updateUser,
};
