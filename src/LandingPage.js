import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Download, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Progress from './Progress';

const supportedPlatforms = [
  { name: 'YouTube', logo: '/logos/youtube.svg' },
  { name: 'Twitter', logo: '/logos/twitter.svg' },
  { name: 'Vimeo', logo: '/logos/vimeo.svg' },
  { name: '9GAG', logo: '/logos/9gag.svg' },
  { name: 'Instagram', logo: '/logos/instagram.svg' },
  { name: 'Facebook', logo: '/logos/facebook.svg' },
  { name: 'Twitch', logo: '/logos/twitch.svg' },
];

const AppleInspiredVideoDownloaderWithFAQ = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);


  const handleProcess = useCallback(async () => {
    if (!videoUrl) return;
    
    setIsLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await axios.post('http://localhost:8000/process-video', { url: videoUrl });
      setVideoInfo(response.data);
    } catch (err) {
      setError('Failed to process video. Please check the URL and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [videoUrl]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (videoUrl) {
        handleProcess();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [videoUrl, handleProcess]);


  
  const handleDownload = async () => {
    if (!selectedFormat) {
      setError('Please select a format to download.');
      return;
    }
    
    try {
      setDownloadProgress(1); // Start progress
      setError(null);
      console.log('Starting download...');
  
      const response = await fetch(
        `http://localhost:8000/download?url=${encodeURIComponent(videoUrl)}&format_id=${selectedFormat}`
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Response headers:', response.headers);
      console.log('Content-Disposition:', response.headers.get('Content-Disposition'));
  
      const estimatedFileSize = parseInt(response.headers.get('X-Estimated-FileSize')) || 10000000; // Default to 10MB if not provided
      console.log(`Estimated file size: ${estimatedFileSize} bytes`);
  
      const reader = response.body.getReader();
      let receivedLength = 0;
      const chunks = [];
  
      while(true) {
        const {done, value} = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        const progress = Math.min(Math.round((receivedLength / estimatedFileSize) * 100), 99);
        setDownloadProgress(progress);
        console.log(`Download progress: ${progress}%`);
      }
  
      setDownloadProgress(100);
      console.log('Download completed: 100%');
  
      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
  
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download';
      if (contentDisposition) {
        const filenameRegex = /filename\*=UTF-8''(.+)/i;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = decodeURIComponent(matches[1]);
        }
      }

      console.log('Extracted filename:', filename);
  
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      console.log(`Download saved as: ${filename}`);
  
    } catch (err) {
      setError(`Failed to download video: ${err.message}`);
      console.error('Download error:', err);
    } finally {
      setDownloadProgress(0);
    }
  };

  const faqs = [
    {
      question: "What does this page do?",
      answer: "This tool allows you to download any video directly to your device with just a single click. Download Vid is a free Download video downloader with ultra fast download speed. Download Video videos as an MP4 in HD, ensuring high quality playback."
    },
    {
      question: "How do I use this tool?",
      answer: "To use this tool, simply enter the link/URL of the Tweet you wish to download into the input field and click the 'Load Videos' button. Then, select whichever quality you want and click the 'Download' button. The video will then be downloaded to your device in MP4 format. This is essentially a Video to MP4 tool, since it allows you to convert any tweet to MP4. This tool is an all-in-one Video video saver."
    },
    {
      question: "How long does it take to download a video?",
      answer: "The download speed will depend on your internet connection and the size of the video. However, our optimal and efficient Video video downloader should keep the download process relatively quick."
    },
    {
      question: "Can I download a Video GIF with this tool?",
      answer: "Yes! Video Vid is also a Video GIF downloader, meaning you can download any Video GIF. Simply enter your Tweet link, click on the 'Load Videos' button. Then select the quality you want to down the GIF in and click 'Download'. Always remember, you can save any Twitter video as a GIF or MP4 using this tool."
    },
    // Add more FAQs here...
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 font-sans">
      <header className="bg-white bg-opacity-90 backdrop-blur-md fixed top-0 left-0 right-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">VidInstantly</h1>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 transition-colors">
            <HelpCircle className="h-5 w-5 mr-1" />
            Help
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <h2 className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Effortless Video Downloads
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12">
          Download your favorite videos with just a click.
        </p>

        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-center mb-6">Supported Platforms and many more..</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {supportedPlatforms.map((platform) => (
              <div key={platform.name} className="flex flex-col items-center">
                <img src={platform.logo} alt={`${platform.name} logo`} className="w-12 h-12 mb-2" />
                <span className="text-sm text-gray-600">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-white shadow-lg border-none rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-8">
            <div className="space-y-6">
              <Input
                type="text"
                placeholder="Paste video URL here"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl py-3 px-4 text-lg transition-all duration-300"
              />
              <Button 
                onClick={handleProcess}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Process Video'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

{videoInfo && (
          <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="relative overflow-hidden rounded-xl mb-6">
              <img 
                src={videoInfo.thumbnail_url} 
                alt="Video thumbnail" 
                className="w-full h-64 object-cover transition-transform duration-300 transform hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-2xl font-bold mb-2 line-clamp-2">{videoInfo.title}</h3>
                <p className="text-sm">Duration: {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>
            <h4 className="text-xl font-semibold mb-4">Select Format:</h4>
            <Select onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-full mb-4 bg-gray-100 border-none text-gray-800 rounded-xl py-3 px-4">
                <SelectValue placeholder="Choose a format" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl shadow-lg">
                {videoInfo.formats.map((format) => (
                  <SelectItem key={format.format_id} value={format.format_id} className="py-2 px-4 hover:bg-gray-100">
                    {format.resolution} - {format.ext}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
                onClick={handleDownload}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                disabled={!selectedFormat || downloadProgress > 0}
              >
                <Download className="mr-2 h-5 w-5" />
                {downloadProgress > 0 
                  ? (downloadProgress === -1 ? 'Downloading...' : `Downloading... ${downloadProgress}%`) 
                  : 'Download Selected Format'}
              </Button>

            {downloadProgress > 0 && (
              <Progress value={downloadProgress} className="mt-4" />
            )}
          </div>
        )}



        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Fast & Reliable", description: "Lightning-fast downloads with our optimized system." },
            { title: "Wide Compatibility", description: "Supports social media videos and GIFs." },
            { title: "High Quality", description: "Download videos in the best available quality." }
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-24">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium hover:text-blue-600 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 text-sm text-gray-600 text-center">
          © 2024 VidInstantly. Please use responsibly and respect copyright laws.
        </div>
      </footer>
    </div>
  );
};

export default AppleInspiredVideoDownloaderWithFAQ;