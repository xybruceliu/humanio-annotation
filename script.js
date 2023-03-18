// set width of all annotation lines to the same as the video
const videoPlayer = document.getElementById("videoPlayer");
const annotationLines = document.getElementsByClassName("annotation-line");
for (let i = 0; i < annotationLines.length; i++) {
    annotationLines[i].style.width = `${videoPlayer.offsetWidth}px`;
}

let annotations = [];

function loadVideo() {
    const video = document.getElementById("videoPlayer");
    const url = document.getElementById("videoUrl").value;
    video.src = url;
    video.load();
  }

function setStartTime() {
    const videoPlayer = document.getElementById("videoPlayer");
    const startTime = document.getElementById("startTime");
    startTime.value = videoPlayer.currentTime.toFixed(2);
}

function setEndTime() {
    const videoPlayer = document.getElementById("videoPlayer");
    const endTime = document.getElementById("endTime");
    endTime.value = videoPlayer.currentTime.toFixed(2);
}

function submitAnnotation() {
    const channel = document.getElementById("channel").value;
    const startTime = parseFloat(document.getElementById("startTime").value);
    const endTime = parseFloat(document.getElementById("endTime").value);
    const effort = parseInt(document.getElementById("effort").value);

    const annotation = {
        channel,
        startTime,
        endTime,
        effort
    };

    annotations.push(annotation);

    const annotationLine = document.getElementById(channel);
    const videoPlayer = document.getElementById("videoPlayer");
    const duration = videoPlayer.duration;

    const startPercentage = (startTime / duration) * 100;
    const endPercentage = (endTime / duration) * 100;

    // add a rectangle to div
    const segment = document.createElement("div");
    segment.className = "segment";
    segment.style.position = "absolute";
    // set left to the left position plus the width of the video times the percentage of the start time
    segment.style.left = `${annotationLine.offsetLeft + (videoPlayer.offsetWidth * (startPercentage / 100))}px`;
    // set width to the width of the video times the percentage of the start and end time
    segment.style.width = `${videoPlayer.offsetWidth * ((endPercentage - startPercentage) / 100)}px`;
    segment.style.height = "10px";

    // select an aesthetic color palette of 4, and set the color based on the channel
    const colors = [
        "#5DA5DA",
        "#FAA43A",
        "#60BD68",
        "#F17CB0",
      ];
    if (channel === "vision") {
        segment.style.backgroundColor = colors[0];
    } else if (channel === "hearing") {
        segment.style.backgroundColor = colors[1];
    } else if (channel === "vocal") {
        segment.style.backgroundColor = colors[2];
    } else if (channel === "hands") {
        segment.style.backgroundColor = colors[3];
    }

    annotationLine.appendChild(segment);
}

function exportCSV() {
    const csvContent = "data:text/csv;charset=utf-8," + "channel,start_time,end_time,effort\n" + annotations.map(annotation => {
        return `${annotation.channel},${annotation.startTime},${annotation.endTime},${annotation.effort}`;
    }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    // get video id
    let filename = document.getElementById("videoUrl").value;
    filename = filename.substring(filename.lastIndexOf("/") + 1, filename.lastIndexOf("."));
    console.log(filename);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
