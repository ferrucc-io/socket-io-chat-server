document.addEventListener('DOMContentLoaded', () => {
  const socket = io(); // eslint-disable-line
  const form = document.getElementById('messageBox');
  form.addEventListener('submit', (e) => {
    const message = document.getElementById('m').value;
    if (message !== '') {
      socket.emit('chat message', message);
      document.getElementById('m').value = '';
    }
    e.preventDefault();
  });
  socket.on('chat message', (msg) => {
    const node = document.createElement('LI');
    const message = document.createTextNode(msg);
    node.appendChild(message);
    document.getElementById('messages').appendChild(node);
    window.scrollTo(0, document.body.scrollHeight);
  });
});
