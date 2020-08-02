const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationShareButton = document.querySelector("#share-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// Templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $linkTemplate = document.querySelector("#link-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const autoScroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new Message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // VIsible Height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far I have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }

    // console.log(newMessageHeight, visibleHeight, containerHeight, scrollOffset);
};

socket.on("message", (message) => {
    console.log(message.text);
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

socket.on("locationMessage", (link) => {
    console.log(link.url);
    const html = Mustache.render($linkTemplate, {
        username: link.username,
        url: link.url,
        createdAt: moment(link.createdAt).format("h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users,
    });
    $sidebar.innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
    $messageFormButton.setAttribute("disabled", true);
    e.preventDefault();
    const message = $messageFormInput.value;
    socket.emit("textMessage", message, (error) => {
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log("Message delivered");
    });
});

$locationShareButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("You browser doesn't support geolocation");
    }
    $locationShareButton.setAttribute("disabled", true);
    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };
        socket.emit("sendLocation", location, (ackMessage) => {
            $locationShareButton.removeAttribute("disabled");
            console.log(ackMessage);
        });
    });
});

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});
