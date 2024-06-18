var usersArr = [];
var currUser = {};
var friendsArr = [];
var messageArr = [];
var messArr = [];
const socket = io()
const token = localStorage.getItem('jwtToken');
const clientsTotal = document.getElementById('client-total');
socket.on('clients-total', (data) => {
    console.log("data",data)
    clientsTotal.innerText = `Total Clients: ${data}`
  })

$(document).ready(function() {
    //Lấy giá trị user
    fetch('http://localhost:3000/api/users', {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        }
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                showNotification(data.message);
                window.location.href = 'http://localhost:3000/login-register';
                throw new Error('Network response was not ok');
            }
            return data;
        });
    })
    .then(result => {
        currUser = result.user;
        usersArr = result.users;
        console.log("currUser",currUser);
        // console.log("usersArr",usersArr);
        const headerContainer = document.querySelector('.header-container');
        // Thêm giá trị vào thuộc tính data-user-id
        if (headerContainer) {
        headerContainer.dataset.userId = currUser._id;
        }
        getFriendsArr();
        // setInterval(getFriendsArr, 5000);

    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });


    // //Lấy giá trị messages
    // fetch('http://localhost:3000/api/messages', {
    //     method: "GET",
    //     headers: {
    //         "Content-Type" : "application/json",
    //         "Authorize" : token
    //     }
    // })
    // .then(response => {
    //     return response.json().then(data => {
    //         if (!response.ok) {
    //             showNotification(data.message);
    //             window.location.href = 'http://localhost:3000/login-register';
    //             throw new Error('Network response was not ok');
    //         }
    //         return data;
    //     });
    // })
    // .then(result => {
        
    //     console.log("result messages",result);
        
    // })
    // .catch(error => {
    //     console.error('There was a problem with your fetch operation:', error);
    // });

})

$(document).ready(function() {
    $(document).on('click', '.userFriend', function(event) {
        event.stopPropagation();
        console.log("userFriend");
        const currUserId = currUser._id;

        var friendId = $(this).closest('.userFriend').data('friend-id');
        console.log("friendId",friendId);
        showMessageList(currUserId, friendId);
    });

    
    $(document).on('click', '.send-message-btn', function(event) {
        event.stopPropagation();
        var friendId = $(this).closest('.messagesContain').data('friend-id');
        const messageText = $('#message-input').val();
        if(messageText == '') {
            showNotification("Hãy nhập gì đó để gửi");
            return;
        }
        var newMess = {
            senderId: currUser._id,
            receiverId: friendId,
            messageText: messageText
        }
        createMessage(newMess)
        // Clear the input field after sending the message
        $('#message-input').val('');
    });



})

function createMessage(newMess) {
    console.log('newMess:', newMess);
    socket.emit('message', newMess);
    fetch('http://localhost:3000/api/message', {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body: JSON.stringify({newMess:newMess})
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                showNotification(data.message);
                window.location.href = 'http://localhost:3000/login-register';
                throw new Error('Network response was not ok');
            }
            return data;
        });
    })
    .then(result => {
        var messages = result.messages;
        console.log("result create messages",messages);
        addMessageToUI(true, messages)
        // const listMess = document.getElementById('messagesText');
        // var messHTML = ``;
        // var senderId = messages.senderId;
        // var receiverId = messages.receiverId;
        // var messageText = messages.messageText;
        // var createdAt = messages.createdAt;
        // var formattedDate  = formatDate(createdAt);
        // messHTML += `
        //     <div class="message message-sent">
        //         <div class="message-bubble">
        //             <p>${messageText}</p>
        //             <time>${formattedDate}</time>
        //         </div>
        //         <div class="avatar message-avatar">
        //             <img src="/userImg/${currUser.profilePicture}" alt="User Avatar">
        //         </div>
        //     </div>
        //     `
        // listMess.innerHTML += messHTML;
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

socket.on('chat-message', (data) => {
    console.log('chat-message',data)
    data.createdAt = Date.now();
    addMessageToUI(false, data)
})

function addMessageToUI(isOwnMessage, data) {
    // clearFeedback()
    console.log("addMessageToUI",data)

    const listMess = document.getElementById('messagesText');
        var messHTML = ``;
        var senderId = data.senderId;
        var receiverId = data.receiverId;
        var messageText = data.messageText;
        // if()
        var createdAt = data.createdAt;
        // var createdAt = Date.now;
        var formattedDate  = formatDate(createdAt);
        if(isOwnMessage == true) {
            messHTML += `
            <div class="message message-sent">
                <div class="message-bubble">
                    <p>${messageText}</p>
                    <time>${formattedDate}</time>
                </div>
                <div class="avatar message-avatar">
                    <img src="/userImg/${currUser.profilePicture}" alt="User Avatar">
                </div>
            </div>
            `
        } else if(isOwnMessage == false) {
            var receiverId = data.senderId;
            var receiver = usersArr.find(user => user._id == receiverId);
            console.log('receiverId',receiverId)
            console.log('receiver',receiver)
            messHTML += `
            <div class="message message-received">
                <div class="avatar message-avatar">
                    <img src="/userImg/${receiver.profilePicture}" alt="User Avatar">
                </div>
                <div class="message-bubble">
                    <p>${messageText}</p>
                    <time>${formattedDate}</time>
                </div>
            </div>
            `
        }
        
        
        listMess.innerHTML += messHTML;
    scrollToBottom()
  }
  
  function scrollToBottom() {
    const listMess = document.getElementById('messagesText');
    listMess.scrollTo(0, listMess.scrollHeight)
  }

function getFriendsArr () {
    //Lấy giá trị friends
    fetch('http://localhost:3000/api/friends', {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
        }
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                showNotification(data.message);
                window.location.href = 'http://localhost:3000/login-register';
                throw new Error('Network response was not ok');
            }
            return data;
        });
    })
    .then(result => {
        friendsArr = result.friends;
        // console.log("friendsArr",friendsArr);
        const currUserId = currUser._id;
        // showUsers(usersArr);
        const friendList = friendsArr.filter(friend => (friend.friendId === currUserId || friend.userId === currUserId) && friend.status === 'accepted');
        showSidebarMess(friendList);
        showNullMessageContain();
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function showMessageList(currUserId, friendId){
    const friendsList1 = document.getElementById('messagesContain1');
    const friendsList = document.getElementById('messagesContain');
    friendsList.dataset.friendId = friendId;

    friendsList.classList.remove('hidden');;
    friendsList1.classList.add('hidden');;
    var friend = usersArr.find(user => user._id === friendId);

    const avatarImg = friendsList.querySelector('.message-header-avatar img');
    const usernameSpan = friendsList.querySelector('.message-header-username');

    // Cập nhật thuộc tính src của hình ảnh và nội dung văn bản của username
    if (avatarImg) {
        avatarImg.src = `/userImg/${friend.profilePicture}`;
    }
    
    if (usernameSpan) {
        usernameSpan.textContent = friend.fullname;
    }

    //Lấy giá trị messages
    fetch('http://localhost:3000/api/message', {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token,
            "senderId" : currUserId,
            "receiverId" : friendId
        },
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                showNotification(data.message);
                window.location.href = 'http://localhost:3000/login-register';
                throw new Error('Network response was not ok');
            }
            return data;
        });
    })
    .then(result => {
        messArr = result.messages;
        console.log("messArr",messArr);
        showMessList(messArr, currUserId, friendId);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}
        
function showMessList(messArr, currUserId, friendId){
    // console.log("messArr",messArr);
    const listMess = document.getElementById('messagesText');
    var messHTML = ``;

    const friend = usersArr.find(user => user._id == friendId);

    if(!messArr) {
        listMess.innerHTML = `
        `;
    } 
    const length = messArr.length;
    
    for (let i = 0; i < length; i++) {
        var senderId = messArr[i].senderId;
        var receiverId = messArr[i].receiverId;
        var messageText = messArr[i].messageText;
        var createdAt = messArr[i].createdAt;
        var formattedDate  = formatDate(createdAt);
        // console.log("messageText",messageText );

        if(currUserId == senderId) {
            messHTML += `
            <div class="message message-sent">
                <div class="message-bubble">
                    <p>${messageText}</p>
                    <time>${formattedDate}</time>
                </div>
                <div class="avatar message-avatar">
                    <img src="/userImg/${currUser.profilePicture}" alt="User Avatar">
                </div>
            </div>
            `
        } else if (currUserId == receiverId) {
            messHTML += `
            <div class="message message-received">
                <div class="avatar message-avatar">
                    <img src="/userImg/${friend.profilePicture}" alt="User Avatar">
                </div>
                <div class="message-bubble">
                    <p>${messageText}</p>
                    <time>${formattedDate}</time>
                </div>
            </div>
            `
        }
        listMess.innerHTML = messHTML;

    }
    scrollToBottom()
}
 

function showNullMessageContain() {
    const friendsList1 = document.getElementById('messagesContain1');
    const friendsList = document.getElementById('messagesContain');
    friendsList.classList.add('hidden');;
    friendsList1.innerHTML = `
        <div class="messageContainerNull"> 
            <h6>Xin chào ${currUser.fullname}. </h6>
            <h7>Hãy chọn bạn bè để nhắn tin!</h7>
        </div>
    `;

}

function showSidebarMess(friendList){
    // console.log("friendList",friendList);
    friendList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const friendsList = document.getElementById('friend-list');
    friendsList.innerHTML = '';
    var length = friendList.length;
    const currUserId = currUser._id;

    const newIdList = friendList
    .filter(friend => friend.friendId === currUserId || friend.userId === currUserId)
    .map(friend => friend.friendId === currUserId ? friend.userId : friend.friendId);
    // console.log("newIdList",newIdList);
    var friendHTML = ``;
    for (let i = 0; i < length; i++) { 
        var friendId = newIdList[i];
        var friend = usersArr.find(user => user._id === friendId);
        // console.log("friend",friend);
        
        var friendStatus = friendStatus = friend.active ? 'online' : 'offline';
        // console.log("friendStatus",friendStatus);

        friendHTML += `
            <div class="userFriend" data-friend-id="${friendId}">
                <div class="avatar sidebar-avatar ${friendStatus}">
                    <img src="/userImg/${friend.profilePicture}" alt="User Avatar">
                </div>
                <span class="username">${friend.fullname}</span>
            </div>
        `
        friendsList.innerHTML = friendHTML;
    }
}

function formatDate(jsonDate) {
    const date = new Date(jsonDate);

    const day = date.getDate();
    const month = date.getMonth() + 1; // Tháng bắt đầu từ 0, cần cộng thêm 1
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Format lại thành chuỗi theo định dạng "dd/MM/yyyy HH:mm"
    const formattedDate = `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year} ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;

    return formattedDate;
}

function showNotification(message) {
    $('#notificationText').text(message);
    $('#notification').show();
    setTimeout(() => {
        setTimeout(() => {
            $('#notification').addClass('right-slide');
        }, 10);
    }, 10);
    setTimeout(() => {
        $('#notification').removeClass('right-slide'); 
        setTimeout(() => {
            $('#notification').hide(); 
        }, 500);
    }, 3000); 
}