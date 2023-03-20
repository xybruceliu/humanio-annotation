// set width of all annotation lines to the same as the video
const videoPlayer = document.getElementById("videoPlayer");
const annotationLines = document.getElementsByClassName("annotation-line");
for (let i = 0; i < annotationLines.length; i++) {
    annotationLines[i].style.width = `${videoPlayer.offsetWidth}px`;
}

let annotations = [];
let curAnnotation = null;
let curAnnotationLine = null;
let needToSubmit = false;

function loadVideo() {
    const video = document.getElementById("videoPlayer");
    const url = document.getElementById("videoUrl").value;
    video.src = url;
    video.load();
  }


for (let i = 0; i < annotationLines.length; i++) {
    annotationLines[i].addEventListener("mousedown", function() {
        startAnnotation(event, this);
    });
}

function startAnnotation(e, annotationLine) {
    if (needToSubmit) {
        alert("Please submit your current annotation");
        return;
    }
    curAnnotationLine = annotationLine;
    const channel = annotationLine.id;
    const videoPlayer = document.getElementById("videoPlayer");
    const duration = videoPlayer.duration;
    const clickPosition = e.clientX - annotationLine.offsetLeft;
    const clickPercentage = clickPosition / annotationLine.offsetWidth;
    const startTime = duration * clickPercentage;
    console.log("start time: " + startTime);
    curAnnotation = {
        channel,
        startTime,
        endTime: null,
        effort: null,
        comment: null,
    };
    annotationLine.addEventListener('mousemove', resizeAnnotation);
    annotationLine.addEventListener('mouseup', endAnnotation);
}

function resizeAnnotation(e) {
    const videoPlayer = document.getElementById("videoPlayer");
    const duration = videoPlayer.duration;
    const clickPosition = e.clientX - curAnnotationLine.offsetLeft;
    const clickPercentage = clickPosition / curAnnotationLine.offsetWidth;
    const curTime = duration * clickPercentage;
    console.log("cur time: " + curTime);

}

function endAnnotation(e) {
    const videoPlayer = document.getElementById("videoPlayer");
    const duration = videoPlayer.duration;
    const clickPosition = e.clientX - curAnnotationLine.offsetLeft;
    const clickPercentage = clickPosition / curAnnotationLine.offsetWidth;
    const endTime = duration * clickPercentage;
    console.log("end time: " + endTime);
    curAnnotation.endTime = endTime;
    curAnnotationLine.removeEventListener('mousemove', resizeAnnotation);
    curAnnotationLine.removeEventListener('mouseup', endAnnotation);
    
    colorAnnotation(curAnnotation.startTime, curAnnotation.endTime, curAnnotation.channel);

    needToSubmit = true;

    showAnnotationForm();
}

function showAnnotationForm() {
    const annotationForm = document.getElementById('annotationForm');
    annotationForm.style.display = 'block';
}



function colorAnnotation(startTime, endTime, channel){
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

    // right click to remove annotation
    segment.addEventListener("contextmenu", function() {
        annotationLine.removeChild(segment);
        // remove annotation from annotations array
        annotations = annotations.filter(annotation => {
            return annotation.startTime !== startTime && annotation.endTime !== endTime;
        });  
    });
}


function submitAnnotation() {
    // get comment
    const comment = document.getElementById("comment").value;
    curAnnotation.comment = comment;
    // get effort
    const effort = document.getElementById("effort").value;
    curAnnotation.effort = effort;

    annotations.push(curAnnotation);
    console.log(curAnnotation);
    curAnnotation = null;
    needToSubmit = false;
    const annotationForm = document.getElementById('annotationForm');
    // clear comment box
    document.getElementById("comment").value = "";
    // reset effort selector
    document.getElementById("effort").selectedIndex = 0;
    annotationForm.style.display = 'none';
}

function exportCSV() {
    const csvContent = "data:text/csv;charset=utf-8," + "channel,start_time,end_time,effort,comment\n" + annotations.map(annotation => {
        return `${annotation.channel},${annotation.startTime},${annotation.endTime},${annotation.effort},${annotation.comment}`;
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
