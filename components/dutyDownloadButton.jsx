import axios from 'axios';

const DownloadButton = () => {
  const handleDownload = async () => {
    try {
      const response = await axios.get('/api/download-duty-chart', {
        responseType: 'blob', // Important for handling binary data
      });

      // Create a URL for the file and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'DutyChart.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error while downloading the file:', error);
    }
  };

  return <button onClick={handleDownload}>Download Duty Chart</button>;
};

export default DownloadButton;
