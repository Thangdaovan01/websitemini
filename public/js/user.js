// const { displayFriendsList,createReplyCommentsHTML, createCommentsHTML, 
//     fileReaderUserImage, fileReaderPostImage,
//     search, showNotification, getQueryParam, findObjectById,
//     showPost, creatNewPost, deletePost, updatePost,
//     updateInfo, displayImage, displayImage1,
//     formatDate, formatDate2, formatDateAndTooltip1, formatDateAndTooltip2, formatTimeAgo,
//     createLike, deleteLike, createPeopleLikeList, getFullnameFromUserId,
//     createNewComment, deleteComment, updateComment, saveComment, saveReplyComment
//  } = require('./index.js');

//  var posts = [];
//  var users = [];
//  var likesArr = [];
//  var commentsArr = [];
//  var friendsArr = [];
//  var user = {};
//  var photoValues1 = [];
//  var profilePicture2 = '';
//  var coverPicture2 = '';
//  var userImageFileName = '';
//  var postImageFileName = '';

//  const token = localStorage.getItem('jwtToken');

 $(document).ready(function() {
     fetch('http://localhost:3000/api/user', {
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
         user = result.user;
         users = result.users;
         posts = result.posts;
         likesArr = result.likes;
         commentsArr = result.comments;
         friendsArr = result.friends;
         // const imgElement = document.querySelector('.image-container img');
         // imgElement.src = `${user.profilePicture}`;
        
         showUser(user, users, posts, friendsArr);
     })
     .catch(error => {
         console.error('There was a problem with your fetch operation:', error);
     });
 })

 $(document).ready(function() {
    $(document).on('click','.add-friend-btn',  function(event) {
        event.stopPropagation();
        const urlParams = new URLSearchParams(window.location.search);
        const friendId = urlParams.get('id');
        const $this = $(this);
        var newFriend = {
            userId: user._id,
            friendId: friendId,
            status: 'pending'
        }

        // createNewFriend(newFriend);


        fetch('http://localhost:3000/api/friend', {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorize" : token
            },
            body:JSON.stringify(newFriend)
        })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    showNotification(data.message);
                    throw new Error('Network response was not ok');
                }
                return data;
            });
        })
        .then(result => {
            // console.log("FRIEND THÀNH CÔNG",result);
            $this.addClass('hidden');
            $('.cancel-friend-btn').removeClass('hidden');
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
        
    });

    
    $(document).on('click','.add-friend-btn-in-view',  function(event) {
        event.stopPropagation();
        const viewprofileFriendId = $(this).closest('.friend').attr('data-viewprofile-friend-id');
        const $this = $(this);
        var newFriend = {
            userId: user._id,
            friendId: viewprofileFriendId,
            status: 'pending'
        }

        // createNewFriend(newFriend);
        fetch('http://localhost:3000/api/friend', {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorize" : token
            },
            body:JSON.stringify(newFriend)
        })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    showNotification(data.message);
                    throw new Error('Network response was not ok');
                }
                return data;
            });
        })
        .then(result => {
            // console.log("FRIEND THÀNH CÔNG",result);
            $this.addClass('hidden');
            $(`.friends-btn1-${viewprofileFriendId}`).removeClass('hidden');
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
        
    });

    $(document).on('click','.cancel-friend-btn, .friends-btn',  function(event) {
        event.stopPropagation();
        console.log("Huý kết bạn");
        const $this = $(this);
        const urlParams = new URLSearchParams(window.location.search);
        const friendId = urlParams.get('id');
        console.log("friendId",friendId);
        console.log("user._id",user._id);

        var cancelFriend = {
            userId: user._id,
            friendId: friendId,
        }
        if(confirm("Huỷ kết bạn")){
            fetch(`http://localhost:3000/api/friend`, {
                method: 'DELETE',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(cancelFriend)
            })
            .then(response => {
                if(!response.ok){
                    throw new Error("Network response not ok!");
                }
                return response.json();
            })
            .then(result =>{
                console.log(result);
    
                $this.addClass('hidden');
                $('.add-friend-btn').removeClass('hidden');
                friendsArr = result.friendsArr;
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
        }

        
    });

    $(document).on('click','.friends-btn1',  function(event) {
        event.stopPropagation();
        console.log("Huý kết bạn");
        const $this = $(this);
        const viewprofileFriendId = $(this).closest('.friend').attr('data-viewprofile-friend-id');
        const viewprofileId = $(this).closest('.friend').attr('data-viewprofile-id');
        const friendElementId = $(this).closest('.friend').attr('data-friend-id');
        const currUserId = user._id;

        var cancelFriend = {
            userId: viewprofileFriendId,
            friendId: user._id,
        }

        console.log("userId",viewprofileFriendId);
        console.log("friendId",user._id);

        if(currUserId == viewprofileId){
            if(confirm("Huỷ kết bạn")){
            fetch(`http://localhost:3000/api/friend`, {
                method: 'DELETE',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(cancelFriend)
            })
            .then(response => {
                if(!response.ok){
                    throw new Error("Network response not ok!");
                }
                return response.json();
            })
            .then(result =>{
                console.log(result);
    
                $(this).closest(`.friend-${friendElementId}`).hide();
                // $('.add-friend-btn').removeClass('hidden');
                friendsArr = result.friendsArr;
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
        }
        } else {
            showNotification("Bạn không có quyền thực hiện");
        }
    });

    $(document).on('click','.accepted-friends-btn',  function(event) {
        event.stopPropagation();
        // const urlParams = new URLSearchParams(window.location.search);
        // const friendId = urlParams.get('id');

        const viewUserFriend = $(this).closest('.friend').attr('data-sender-friend-id');
        const friendElementId = $(this).closest('.friend').attr('data-friend-id');

        const $this = $(this);
        var updateFriend = {
            _id: friendElementId,
            userId: viewUserFriend,
            friendId: user._id,
            status: 'accepted'
        }

        fetch('http://localhost:3000/api/friend', {
            method: "PUT",
            headers: {
                "Content-Type" : "application/json",
                "Authorize" : token
            },
            body:JSON.stringify(updateFriend)
        })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    showNotification(data.message);
                    throw new Error('Network response was not ok');
                }
                return data;
            });
        })
        .then(result => {
            $(this).text('Bạn bè');
            $(this).removeClass('accepted-friends-btn').addClass('friends-btn1');
            friendsArr = result.friendsArr;
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
        
    });

    $(document).on('click','.friends-list-btn, .posts-list-btn',  function(event) {
        event.stopPropagation();
        const urlParams = new URLSearchParams(window.location.search);
        const viewUserId = urlParams.get('id'); //id người mà mk đang xem trang cá nhân
        $('.friends-list').toggle();
        $('.main-content').toggle(); // Ẩn hoặc hiện các khối div khác
        
        // const friendList = friendsArr.filter(friend => friend.friendId == friendId )
        const friendList = friendsArr.filter(friend => friend.friendId === viewUserId || friend.userId === viewUserId);

        console.log("friendList",friendList);

        displayFriendsList(friendList, viewUserId);
    });


 })


// Hàm để hiển thị danh sách bạn bè
function displayFriendsList(viewUserFriendList, viewUserId) {
    const friendsList = document.getElementById('friends-list');
    const currUser = user;
    const currUserFriendList = friendsArr.filter(user => user.userId === currUser._id || user.friendId === currUser._id);

    // Xóa dữ liệu cũ
    friendsList.innerHTML = '';

    // Lặp qua danh sách bạn bè và thêm vào giao diện
    for (let i = 0; i < viewUserFriendList.length; i++) {
        const viewUserFriend = viewUserFriendList[i];
        const viewUserFriendId = viewUserFriend._id;

        var viewUserFriend1 = viewUserFriend.userId;
        var viewUserFriend2 = viewUserFriend.friendId;

        const senderFriend1 = findObjectById(users, viewUserFriend1);  // cái này là viewUserId gửi đến người khác
        const senderFriend2 = findObjectById(users, viewUserFriend2); // cái này là người khác gửi đễn viewUserId
    
        //Nếu người dùng (currUser) đang xem danh sáhc của chính mình
        if(currUser._id == viewUserId) {
            // người khác gửi đến mình
            if (viewUserFriend.friendId == viewUserId) {
                var friendElementHTML = `
                    <div class="friend friend-${viewUserFriendId}" data-friend-id="${viewUserFriendId}" data-viewprofile-friend-id="${viewUserFriend1}" data-viewprofile-id="${viewUserId}">
                        <img src="/userImg/${senderFriend1.profilePicture}" alt="">
                        <span>${senderFriend1.fullname}</span>
                        <div class="actions">
                            ${viewUserFriend.status == 'pending' ? '<button class="btn accepted-friends-btn" >Chấp nhận</button>' : ''}
                            ${viewUserFriend.status == 'accepted' ? '<button class="btn friends-btn1">Bạn bè</button>' : ''}
                        </div>
                    </div>
                `;
                friendsList.innerHTML += friendElementHTML;
            } 
            // mình gửi đến người khác

            if ( viewUserFriend.userId == viewUserId) {
                var friendElementHTML1 = `
                    <div class="friend friend-${viewUserFriendId}" data-friend-id="${viewUserFriendId}" data-viewprofile-friend-id="${viewUserFriend2}" data-viewprofile-id="${viewUserId}">
                        <img src="/userImg/${senderFriend2.profilePicture}" alt="">
                        <span>${senderFriend2.fullname}</span>
                        <div class="actions">
                            ${viewUserFriend.status == 'pending' ? '<button class="btn friends-btn1" >Đã gửi lời mời</button>' : ''}
                            ${viewUserFriend.status == 'accepted' ? '<button class="btn friends-btn1">Bạn bè</button>' : ''}
                        </div>
                    </div>
                `;
                friendsList.innerHTML += friendElementHTML1;
            }
        } else { //Nếu người dùng (currUser) đang xem danh sáhc của người khác
            if(viewUserFriend.status == 'accepted'){
                if (viewUserFriend.friendId == viewUserId) {
                    var existsFriends = currUserFriendList.filter(user => user.userId === viewUserFriend1 || user.friendId === viewUserFriend1);
                    var buttonHTML = '';
                    if (existsFriends.length == 0) {
                        buttonHTML = '<button class="btn add-friend-btn-in-view">Thêm bạn bè</button>';
                    } else {
                        if (existsFriends[0].status == 'pending') {
                            buttonHTML = '<button class="btn friends-btn1 friends-btn1-${viewUserFriend1}">Đã gửi lời mời</button>';
                        } else if (existsFriends[0].status == 'accepted') {
                            buttonHTML = '<button class="btn friends-btn1">Bạn bè</button>';
                        }
                    }
                    var friendElementHTML = `
                        <div class="friend friend-${viewUserFriendId}" data-friend-id="${viewUserFriendId}" data-viewprofile-friend-id="${viewUserFriend1}" data-viewprofile-id="${viewUserId}">
                            <img src="/userImg/${senderFriend1.profilePicture}" alt="">
                            <span>${senderFriend1.fullname}</span>
                            <div class="actions">
                            ${buttonHTML}
                            <button class="btn friends-btn1 friends-btn1-${viewUserFriend1} hidden" >Đã gửi lời mời</button>
                            </div>
                        </div>
                    `;
                    friendsList.innerHTML += friendElementHTML;
                } 
                // mình gửi đến người khác
                if ( viewUserFriend.userId == viewUserId) {
                    var existsFriends = currUserFriendList.filter(user => user.userId === viewUserFriend1 || user.friendId === viewUserFriend1);
                    var buttonHTML = '';
                    if (existsFriends.length == 0) {
                        buttonHTML = '<button class="btn add-friend-btn-in-view">Thêm bạn bè</button>';
                    } else {
                        if (existsFriends[0].status == 'pending') {
                            buttonHTML = '<button class="btn friends-btn1 friends-btn1-${viewUserFriend1}">Đã gửi lời mời</button>';
                        } else if (existsFriends[0].status == 'accepted') {
                            buttonHTML = '<button class="btn friends-btn1">Bạn bè</button>';
                        }
                    }
                    var friendElementHTML1 = `
                        <div class="friend friend-${viewUserFriendId}" data-friend-id="${viewUserFriendId}" data-viewprofile-friend-id="${viewUserFriend2}" data-viewprofile-id="${viewUserId}">
                            <img src="/userImg/${senderFriend2.profilePicture}" alt="">
                            <span>${senderFriend2.fullname}</span>
                            <div class="actions">
                                ${buttonHTML}
                                <button class="btn friends-btn1 hidden" >Đã gửi lời mời</button>
                            </div>
                        </div>
                    `;
                    friendsList.innerHTML += friendElementHTML1;
                }
            }
        }
    }
}

function createNewFriend(newFriend){
    fetch('http://localhost:3000/api/friend', {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorize" : token
            },
            body:JSON.stringify(newFriend)
        })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    showNotification(data.message);
                    throw new Error('Network response was not ok');
                }
                return data;
            });
        })
        .then(result => {
            // console.log("FRIEND THÀNH CÔNG",result);
            $this.addClass('hidden');
            $('.cancel-friend-btn').removeClass('hidden');
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

 async function showUser(user, users, posts, friendsArr){
    console.log("showUser")
    const imgElement = document.querySelector('.image-container img');
    imgElement.src = `/userImg/${user.profilePicture}`;

    var userId = getQueryParam('id'); //user mà đang xem trang cá nhân của họ
    
    const friendVal = friendsArr.find(f => f.userId === user._id && f.friendId === userId);

    var UserProfile = findObjectById(users, userId); //mảng của người mà mk đang xem trang cá nhân
    
    //Nếu người dùng đăng nhập đang xem trang của mình
    if (userId === user._id) {
        document.querySelector('.add-friend-btn').classList.add('hidden');
        document.querySelector('.edit-info-btn').classList.remove('hidden');
        document.querySelector('.post-header-container').classList.remove('hidden');

    } else {
        document.querySelector('.edit-info-btn').classList.add('hidden');
        document.querySelector('.post-header-container').classList.add('hidden');
        if(friendVal){
            var friendValStatus = friendVal.status;

            if(friendValStatus == 'pending'){
                document.querySelector('.add-friend-btn').classList.add('hidden');
                document.querySelector('.cancel-friend-btn').classList.remove('hidden');
                document.querySelector('.friends-btn').classList.add('hidden');
            }

            if(friendValStatus == 'accepted'){
                document.querySelector('.add-friend-btn').classList.add('hidden');
                document.querySelector('.cancel-friend-btn').classList.add('hidden');
                document.querySelector('.friends-btn').classList.remove('hidden');
            }
        } else {
            document.querySelector('.add-friend-btn').classList.remove('hidden');
        }
    }

    const coverPhotoElement = document.querySelector('.profile-container .cover-photo img');
    if(UserProfile.coverPicture){
        coverPhotoElement.src = `/userImg/${UserProfile.coverPicture}`;
    } else {
        coverPhotoElement.src = '/userImg/cover.jpg';
    }

    const avatarPhotoElement = document.querySelector('.profile-container .user-info .avatar img');
    if(UserProfile.profilePicture){
        avatarPhotoElement.src = `/userImg/${UserProfile.profilePicture}`;
    } else {
        avatarPhotoElement.src = '/userImg/avatar.jpg';
    }

    const username = document.querySelector('.profile-container .user-info .user-details .user-name');
    username.textContent  = `${UserProfile.fullname}`;

    var userDetailsSection = document.querySelector('.user-details-section');
        var newParagraph = document.createElement('p');
        newParagraph.textContent = 'Bio: ' + `${UserProfile.bio}`;
        userDetailsSection.appendChild(newParagraph);

        var birthday = formatDate(UserProfile.birthday);
        var newParagraph1 = document.createElement('p');
        newParagraph1.textContent = 'Birthday: ' + `${birthday}`;
        userDetailsSection.appendChild(newParagraph1);

        const postsUser = posts.filter(item => item.createdBy == UserProfile._id);
        showPost(postsUser, 'user-posts-section');
}

 