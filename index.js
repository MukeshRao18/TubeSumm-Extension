const express = require('express');
const cors = require('cors');
const { getTranscript: fetchTranscript } = require('youtube-transcript-api');
const { HfInference } = require('@huggingface/inference');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HF_ACCESS_KEY = "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";

if (!HF_ACCESS_KEY) {
  throw new Error('HF_ACCESS_KEY is not defined in the .env file');
}

const hf = new HfInference(HF_ACCESS_KEY);

app.use(cors());

app.get('/summary', async (req, res) => {
  try {
    const url = req.query.url;
    const start = parseFloat(req.query.start);
    const end = parseFloat(req.query.end);
  
    if (!url) {
      return res.status(400).send({ error: 'URL parameter is required' });
    }
  
    const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (!videoIdMatch) {
      return res.status(400).send({ error: 'Invalid YouTube URL' });
    }
    const videoId = videoIdMatch[1];
    
    const transcript = await getTranscript(videoId, start, end);
    const summary = await getSummary(transcript);
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Error during summarization:', error);
    res.status(500).send({ error: 'Failed to generate summary' });
  }
});

const getTranscript = async (videoId, start, end) => {
  const transcriptList = await fetchTranscript(videoId);
  if (!start && !end) {
    return transcriptList.map(item => item.text).join(' ');
  }
  const filteredTranscriptList = transcriptList.filter(item => {
    const itemStart = parseFloat(item.start);
    const itemEnd = itemStart + parseFloat(item.duration);
    return (!isNaN(start) ? itemStart >= start : true) && (!isNaN(end) ? itemEnd <= end : true);
  });
  return filteredTranscriptList.map(item => item.text).join(' ');
};

const getSummary = async (transcript) => {
  const summarizer = hf.summarization.bind(hf);
  let summary = '';
  const chunkSize = 1000;
  for (let i = 0; i < transcript.length; i += chunkSize) {
    const chunk = transcript.slice(i, i + chunkSize);
    const result = await summarizer({
      model: 'facebook/bart-large-cnn',
      inputs: chunk,
      parameters: { max_length: 100 }
    });


    if (result && result.summary_text) {
      summary += result.summary_text + ' ';
    } else {
      console.error('Unexpected response from Hugging Face API:', result);
      throw new Error('Failed to retrieve summary from Hugging Face API');
    }
  }
  return summary.trim();
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
