require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./routes/users");  // Correct model path
const Post = require("./routes/post");  // Correct model path
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/pinterest-clone";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedDB() {
  await User.deleteMany({});
  await Post.deleteMany({});

  const users = [];

  for (let i = 0; i < 15; i++) {
    const username = faker.internet.userName().toLowerCase();
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const password = await bcrypt.hash("1234", 10);
    const profileImage = `https://picsum.photos/seed/p${i + 1}/200/200`;

    const user = new User({
      username,
      name,
      email,
      password,
      contact: faker.number.int({ min: 6000000000, max: 9999999999 }),
      profileImage,
    });

    await user.save();

    const posts = [];
    const numberOfPosts = Math.floor(Math.random() * 11) + 10;

    for (let j = 0; j < numberOfPosts; j++) {
      const post = new Post({
        user: user._id,
        title: faker.lorem.words(3),
        description: faker.lorem.sentences(2),
        image: `https://picsum.photos/seed/u${i}p${j}/400/300`,
      });

      await post.save();
      posts.push(post._id);
    }

    user.posts = posts;
    await user.save();

    users.push(user);
  }

  console.log(`✅ Seeded ${users.length} users with posts`);
  mongoose.connection.close();
}

seedDB().catch((err) => {
  console.error("❌ Error seeding database:", err);
  mongoose.connection.close();
});
