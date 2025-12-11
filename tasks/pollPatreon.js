const Post = require('../db/patreonSchema');
const { EmbedBuilder } = require('discord.js');

const CAMPAIGN_ID = 13532645;
const CHANNEL_ID = '1333435650950696980';

async function pollPatreon(client) {
  try {
    const allPosts = await fetchPosts();
    allPosts.reverse();

    const lastSavedPost = await getLastSavedPost();
    const lastPostId = lastSavedPost ? lastSavedPost.postId : null;

    const cutOffIndex = allPosts.findIndex(post => post.id === lastPostId);

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

    newPosts.reverse();

    for (const post of newPosts) {
      const thumbnail = await getThumbnail(`https://www.patreon.com${post.attributes.url}`);
      await sendDiscordNotification(channel, post, thumbnail);
    }

    await savePostsToDb(newPosts);
  } catch (error) {
    console.error('Error in pollPatreon execution:', error);
  }
}

async function getThumbnail(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
      },
    });

    const html = await response.text();

    // Regex to find <meta property="og:image" content="..." />
    const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

    if (match && match[1]) {
      return match[1];
    } else {
      console.log('No OG image found.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching page:', error);
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
    content: post.attributes.content,
  }));

  await Post.insertMany(documents);
  console.log(`Saved ${documents.length} posts to database.`);
}

async function getDiscordChannel(client, channelId) {
  try {
    return await client.channels.fetch(channelId);
  } catch (err) {
    console.error('Failed to fetch Discord channel:', err.message);
    return null;
  }
}

async function sendDiscordNotification(channel, post, thumbnail) {
  const postEmbed = new EmbedBuilder()
    .setTitle(post.attributes.title)
    .setAuthor({
      name: 'ServersatHome published a new video on Patreon',
      icon_url: 'https://cdn.discordapp.com/avatars/922966543934042172/2eb035fd0614f9ef86ef2651fb8c1984.webp',
      url: `https://www.patreon.com${post.attributes.url}`,
    })
    .setURL(`https://www.patreon.com${post.attributes.url}`)
    .setTimestamp()
    .setColor('#f1592a');
  if (thumbnail) {
    postEmbed.setThumbnail(thumbnail);
  } else {
    postEmbed.setDescription(post.attributes.content);
  }
  await channel.send({ content: '<@&1333433484290691084>', embeds: [postEmbed] });
}

async function fetchPosts() {
  const access_token = process.env.PATREON;

  let allPosts = [];

  const params = new URLSearchParams({
    'fields[post]': 'title,url,published_at,content',
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
