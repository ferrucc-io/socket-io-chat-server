document.addEventListener('DOMContentLoaded', () => {
  const socket = io(); // eslint-disable-line
  const form = document.getElementById('messageBox');
  const userID = `user ${Math.round(Math.random() * 1000000)}`; // Set a username on connection -- In the future it might be a good idea to make an API call that returns the users IP address hashed
  form.addEventListener('submit', (e) => {
    const message = {
      body: document.getElementById('m').value,
      sender: userID,
    };
    console.log(message.sender);
    if (message.body !== '') {
      socket.emit('chat message', message);
      document.getElementById('m').value = '';
    }
    e.preventDefault();
  });
  socket.on('chat message', (msg) => {
    const node = document.createElement('LI');
    const message = document.createTextNode(`[${msg.sender}]: ${msg.body}`);
    node.appendChild(message);
    document.getElementById('messages').appendChild(node);
    window.scrollTo(0, document.body.scrollHeight);
  });
});
