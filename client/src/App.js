import './App.css';
import { VideoEditor } from 'video-editor'
import { useState } from 'react';
import axios from 'axios'

function App() {

  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [videoSrc, setVideoSrc] = useState()
  const [videoMetaData, setVideoMetaData] = useState()
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState()

  const handleVideoTimelineUpdate = (e) => {
    // console.log(e)
    setStartTime(Math.round(e.start))
    setEndTime(Math.round(e.end))
  }

  const handleVideoTrim = async () => {
    try {
      console.log("triming.......")
      const data = {
        "startTime": startTime,
        "duration": endTime - startTime,
        "fileName": videoMetaData?.filename
      }
      const response = await axios.post("http://localhost:5000/trim", data)
      console.log(response.data);
      setTimeout(() => {

        setTrimmedVideoUrl(response.data?.url)
      }, 2000);
    } catch (error) {

    }
  }

  const handleFileChange = async (e) => {
    try {
      console.log(e.target.files);
      var url = URL.createObjectURL(e.target.files[0]);
      console.log(url);
      const formData = new FormData()
      formData.append("myFile", e.target.files[0])
      const data = await axios.post("http://localhost:5000/uploadfile", formData)
      setVideoMetaData(data.data)
      setVideoSrc(url);

    } catch (error) {

    }
  }

  return (
    <div className="App">
      <h1>Hello</h1>
      {/* <ReactHtml5Video /> */}

      <input type="file" onChange={handleFileChange} accept="video/*" />
      {
        videoSrc && <>
          <div style={{ width: "50%", margin: "0 auto" }} >

            <VideoEditor src={videoSrc} preload={true}
              muted={true} onUpdate={handleVideoTimelineUpdate} />
          </div>
          <div style={{ marginTop: "25px" }} >
            <input placeholder='Start Time' value={startTime} type="number" />
            <input placeholder='End Time' value={endTime || videoMetaData?.duration?.seconds} type="number" />
            <button onClick={handleVideoTrim} >Trim</button>
          </div>
        </>

      }

      {
        trimmedVideoUrl && <div>
          <video src={trimmedVideoUrl} controls />

        </div>
      }
    </div>
  );
}

export default App;
