import WebSocket from 'ws';
import { createWriteStream } from 'fs';

export class MurfTTSClient {
  constructor(apiKey, sampleRate = 44100, channelType = 'MONO', format = 'WAV') {
    this.apiKey = apiKey;
    this.sampleRate = sampleRate;
    this.channelType = channelType;
    this.format = format;
    this.ws = null;
    this.audioCallback = null;
    this.isFirstChunk = true;
    this.readyPromise = null;
    this.resolveReady = null;
    
    // Create a promise to track when the connection is ready
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  async connect(audioCallback) {
    this.audioCallback = audioCallback;
    
    const wsUrl = `wss://api.murf.ai/v1/speech/stream-input?api-key=${this.apiKey}&sample_rate=${this.sampleRate}&channel_type=${this.channelType}&format=${this.format}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.on('open', () => {
      console.log('Connected to Murf AI WebSocket');
      
      // Send voice configuration
      const voiceConfigMsg = {
        voice_config: {
          voiceId: "en-US-amara",
          style: "Conversational",
          rate: 0,
          pitch: 0,
          variation: 1
        }
      };
      
      console.log('Sending voice config:', voiceConfigMsg);
      this.ws.send(JSON.stringify(voiceConfigMsg));
      
      // Resolve the ready promise
      this.resolveReady();
    });
    
    this.ws.on('message', (data) => {
      try {
        const response = JSON.parse(data);
        console.log('Received from Murf:', response);
        
        if (response.audio) {
          const audioBytes = Buffer.from(response.audio, 'base64');
          
          // Skip the first 44 bytes (WAV header) only for the first chunk
          let processedAudio = audioBytes;
          if (this.isFirstChunk && audioBytes.length > 44) {
            processedAudio = audioBytes.slice(44);
            this.isFirstChunk = false;
          }
          
          // Send audio to the callback function
          if (this.audioCallback) {
            this.audioCallback(processedAudio.toString('base64'));
          }
        }
        
        if (response.final) {
          console.log('Final audio chunk received');
        }
      } catch (error) {
        console.error('Error processing Murf response:', error);
      }
    });
    
    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    this.ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
    
    return this.readyPromise;
  }

  sendText(text, isEnd = false) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const textMsg = {
        text: text,
        end: isEnd
      };
      
      console.log('Sending text to Murf:', textMsg);
      this.ws.send(JSON.stringify(textMsg));
    } else {
      console.warn('WebSocket is not open. Cannot send text.');
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Create and export a Murf client instance
export function initiateMurfClient(audioCallback) {
  const apiKey = process.env.MURF_API_KEY;
  if (!apiKey) {
    throw new Error('MURF_API_KEY environment variable is not set');
  }
  
  const murfClient = new MurfTTSClient(apiKey);
  murfClient.connect(audioCallback);
  
  return murfClient;
}