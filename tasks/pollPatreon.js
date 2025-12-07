const Post = require('../db/patreonSchema');

const CAMPAIGN_ID = 13532645;
const CHANNEL_ID = '1333435650950696980';

async function pollPatreon(client) {
  try {
    const allPosts = await fetchPosts();

    const lastSavedPost = await getLastSavedPost();
    const lastPostId = lastSavedPost ? lastSavedPost.postId : null;

    const cutOffIndex = allPosts.findIndex(post => post.id == lastPostId);

    let newPosts = allPosts;
    if (cutOffIndex !== -1) {
      newPosts = allPosts.slice(0, cutOffIndex);
    }

    if (newPosts.length === 0) {
      return;
    }

    console.log(`Found ${newPosts.length} new posts. Processing...`);

    const channel = await getDiscordChannel(client, CHANNEL_ID);
    if (!channel) {
      console.error(`Could not find channel with ID ${CHANNEL_ID}`);
      return;
    }

    const postsToPublish = [...newPosts].reverse();

    for (const post of postsToPublish) {
      await sendDiscordNotification(channel, post);
    }

    await savePostsToDb(postsToPublish);
  } catch (error) {
    console.error('Error in pollPatreon execution:', error);
  }
}

async function getLastSavedPost() {
  return await Post.findOne().sort({ publishedAt: -1 }).lean();
}

async function savePostsToDb(posts) {
  const documents = posts.map(post => ({
    postId: post.id,
    title: post.attributes.title,
    publishedAt: new Date(post.attributes.published_at),
    url: post.attributes.url,
  }));

  await Post.insertMany(documents);
  console.log(`Saved ${documents.length} posts to database.`);
}

async function getDiscordChannel(client, channelId) {
  let channel = client.channels.cache.get(channelId);
  if (!channel) {
    try {
      channel = await client.channels.fetch(channelId);
    } catch (err) {
      console.error('Failed to fetch Discord channel:', err.message);
      return null;
    }
  }
  return channel;
}

async function sendDiscordNotification(channel, post) {
  const postUrl = `https://www.patreon.com${post.attributes.url}`;
  await channel.send(postUrl);
}

async function fetchPosts() {
  const access_token = process.env.PATREON;

  let allPosts = [];

  const params = new URLSearchParams({
    'fields[post]': 'title,url,published_at',
    'page[count]': '100',
  });

  let nextLink = `https://www.patreon.com/api/oauth2/v2/campaigns/${CAMPAIGN_ID}/posts?${params}`;

  console.log('Checking Patreon for updates...');

  try {
    while (nextLink) {
      const response = await fetch(nextLink, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Patreon API Error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const pageData = json.data || [];

      allPosts = allPosts.concat(pageData);

      if (!json.links || !json.links.next) {
        break;
      }

      nextLink = json.links.next;
    }

    return allPosts;
  } catch (error) {
    console.error('Error fetching from Patreon:', error);
    return [];
  }
}

module.exports = { pollPatreon };
