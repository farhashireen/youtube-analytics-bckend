const fetchChannelData = async () => {
  if (!channelName) return;
  setLoading(true);
  setError('');
  setChannelData(null);
  setVideos([]);

  try {
    const res = await axios.get(`https://youtube-analytics-backend.onrender.com/channel?name=${channelName}`);
    setChannelData(res.data.channel);
    setVideos(res.data.videos);
  } catch (err) {
    console.error(err);
    setError('Channel not found or failed to load.');
  } finally {
    setLoading(false);
  }
};
