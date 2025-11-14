// Helper function to emit notifications via Socket.io
const emitNotification = (io, userId, notification) => {
  if (io) {
    io.to(`user-${userId}`).emit('notification', notification);
  }
};

module.exports = { emitNotification };

