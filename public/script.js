const socket = io('/');
const videoGrid = document.getElementById('video')
const mypeer = new Peer(
//   undefined, {
//   host: '/',
//   port: '3001',
// }
)

const myvideo = document.createElement('video');
myvideo.muted = true;
const peers ={};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myvideo, stream);

  mypeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video');

    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })


  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  })
})

socket.on('user-disconnected',userId=>{
  // console.log(userId)
  if(peers[userId]) peers[userId].close()
})
mypeer.on('open', id => {
  socket.emit("join-room", ROOM_ID, id);

})

// socket.emit("join-room",ROOM_ID,10);

socket.on('user-connected', userId => {
  console.log("User Connected: " + userId)

})

function connectToNewUser(userId, stream) {
  const call = mypeer.call(userId, stream)
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  });
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call ;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video)
}