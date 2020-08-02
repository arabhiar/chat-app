const { query } = require("express");

let users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    if (!username || !room) {
        return {
            error: "Username and room name are required",
        };
    }
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    });

    if (existingUser) {
        return {
            error:
                "User with this username already exist. Please try different one.",
        };
    }

    user = {
        id,
        room,
        username,
    };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const queryIndex = users.findIndex((user) => {
        return user.id === id;
    });
    if (queryIndex !== -1) {
        // console.log(users.splice(queryIndex, 1)[0])
        return users.splice(queryIndex, 1)[0];
    }
};

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id;
    });
    if (user) {
        return user;
    }
};

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        return user.room === room;
    });
    return usersInRoom;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
};
