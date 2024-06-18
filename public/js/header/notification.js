var notificationsArr = [];
var currUser = {};
var usersArr = [];
var likesArr = [];
var commentsArr = [];
var friendsArr = [];
var postsArr = [];
var postPageArr = [];


const notificationsArrProxy = new Proxy(notificationsArr, {
    set(target, property, value, receiver) {
        target[property] = value;
        if (property != 'length') {
            updateNotificationCount();
            // showPost(target, 'post-container');
        }
        return true;
    }
});

$(document).ready(function() {
    //Lấy giá trị user
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
        currUser = result.user;
        usersArr = result.users;
        postsArr = result.posts;
        likesArr = result.likes;
        commentsArr = result.comments;
        friendsArr = result.friends;
        // showNotificationList()
        // Gọi hàm mỗi 10 giây
        setInterval(showNotificationList, 5000);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });


    
})

$(document).ready(function() {

    $(document).on('click', '#notification1', function(event) { 
        event.stopPropagation();
        console.log("#notification1")
        $('#notificationList').toggleClass('active');
        console.log($('#notificationList').attr('class'));
    });
    

    $(document).click(function(event) {
        if (!$(event.target).closest('#notificationList').length) {
            $('#notificationList').removeClass('active');
        }
    });    

    $(document).on('click', '.notification-like, .notification-comment, .notification-comment-like', function(event) { 
        event.stopPropagation();
        var postId = $(this).data('post-id');
        var notificationId = $(this).data('notification-id');
        deleteNotification (notificationId);
        deleteNotificationHTML(notificationId);
        window.location.href = `http://localhost:3000/post/${postId}`;

        // showPostPage(postId);
        $('#notificationList').removeClass('active');
        console.log('Post ID:', postId);
    });

    $(document).on('click', '.notification-friend', function(event) { 
        event.stopPropagation();
        var friendId = $(this).data('friend-id');
        var notificationId = $(this).data('notification-id');
        deleteNotification (notificationId);
        deleteNotificationHTML(notificationId);
        window.location.href = 'http://localhost:3000/user?id='+friendId;

        // showPostPage(postId);
        $('#notificationList').removeClass('active');
        console.log('Post ID:', postId);
    });

})

function updateNotificationCount() {
    const notificationCountElement = document.getElementById('notificationCount');
    const count = notificationsArr.length;
    console.log("count",count);

    if (count > 0) {
        notificationCountElement.textContent = count;
        notificationCountElement.style.display = 'block';
    } else {
        notificationCountElement.style.display = 'none';
    }
}

function deleteNotificationHTML(notificationId) {
    const listNotification = document.getElementById('notificationList');
    
    const notificationToRemove = listNotification.querySelector(`[data-notification-id="${notificationId}"]`);

    // Kiểm tra nếu phần tử tồn tại trước khi xoá
    if (notificationToRemove) {
        listNotification.removeChild(notificationToRemove);
    } else {
        console.log(`Không tìm thấy thông báo với ID ${notificationIdToDelete}`);
    }
}

function showPostPage(postId){
    //Lấy giá trị user
    fetch(`http://localhost:3000/api/post`, {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "postId" : postId
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
        postPageArr.push(result.post)
        // showPostPage (postPage);
        // var postContentContainer = document.querySelector(`.post-content-container`);
        showPost(postPageArr, 'post-container');
    }) 
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}


function deleteNotification (notificationId) {
    fetch(`http://localhost:3000/api/notification`, {
        method: 'DELETE',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({notificationId:notificationId})
    })
    .then(response => {
        if(!response.ok){
            throw new Error("Network response not ok!");
        }
        return response.json();
    })
    .then(result =>{
        // console.log("likeArr createLike result",result.likeArr1);
        // likesArr = result.likeArr1;
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}
 
async function showPost(postsArr, className) {
    // console.log(" showPost likesArr");
    var postContentContainer = document.querySelector(`.${className}`);
    var dataLength = postsArr.length;

    const divElement = document.querySelector('.image-container.user-page');

    if (divElement) {
        divElement.dataset.value = user._id;
    }

    var postContent = ``;
    for (let i = 0; i < dataLength; i++) {
        const postsArrId = postsArr[i]._id;
        
        var userCreate = findObjectById(users, postsArr[i].createdBy );
        var postCreatedAt = formatDateAndTooltip1(postsArr[i].createdAt);
        var postCreatedAtTooltip = formatDateAndTooltip2(postsArr[i].createdAt); //Số lượt like
        
        //Hiển thị những người like
        var likesPost = likesArr.filter(item => item.likePostId == postsArrId);
        var peoplelikesPost = likesPost.map(user => user.userId);
        var fullnamePeopleLike = getFullnameFromUserId(peoplelikesPost, users);
        var peoplelikesPostList = createPeopleLikeList(fullnamePeopleLike);
        
        //Hiển thị biểu tượng like
        var likedClass = '';
        var isExist = likesPost.some(item => item.userId == user._id);
        if (isExist) {
            likedClass = 'liked';
        } 
        //Lấy các giá trị comment
        var commentsPost = commentsArr.filter(item => item.postId == postsArrId);
        var commentHtml = createCommentsHTML(commentsPost, users, likesArr, user);
        // console.log("commentsPost", commentsPost)

        var documentTitle = postsArr[i].title;
        if(!documentTitle){
            var postAuthorName = `
            <div>
                <div class="author-name user-page" data-value="${ postsArr[i].createdBy }">
                    ${userCreate.fullname} <span>đã thêm một bài đăng</span>
                </div>
                <div class="post-create" id="date-containers" data-value="${ postsArrId }">
                    <span class="post-create1 post-create-${ postsArrId }" data-post-id="${postsArrId}">${ postCreatedAt }</span>
                    <div class="tooltip1 tooltip1-${ postsArrId }"> <span>${postCreatedAtTooltip}</span></div>
                </div>
            </div>
            `;
            var postDesImg = `
            <div class="post-content">
                <!-- Description -->
                <span class="description">${postsArr[i].description}</span>
                <!-- Ảnh -->
                <div class="image-upload">
                    
                    <!-- Hiển thị ảnh được tải lên -->
                    <div class="preview-images">
                        <img src="/postImg/${postsArr[i].photo[0]}" alt="">
                    </div>
                </div>
            </div>
            `
        }else{
            var postAuthorName = `
            <div>
                <div class="author-name user-page" data-value="${ postsArr[i].createdBy }">
                    ${userCreate.fullname} <span>đã thêm một Tài liệu</span>
                </div>
                <div class="post-create" id="date-containers" data-value="${ postsArrId }">
                    <span class="post-create1 post-create-${ postsArrId }" data-post-id="${postsArrId}">${ postCreatedAt }</span>
                    <div class="tooltip1 tooltip1-${ postsArrId }"> <span>${postCreatedAtTooltip}</span></div>
                </div>
            </div>
            `;
            var postDesImg = `
            <div class="post-content document-post-content" data-document-id=${postsArr[i].documentId}>
                <!-- Description -->
                <h5 class="title">${postsArr[i].title}</h5>
                <span class="description">${postsArr[i].description}</span>
                <!-- Ảnh -->
                <div class="image-upload">
                    
                    <!-- Hiển thị ảnh được tải lên -->
                    <div class="preview-images">
                        <img src="/documentsImg/${postsArr[i].photo[0]}" alt="">
                    </div>
                </div>
            </div>
            `
        }

        postContent += `
        <div class="post-content-container1 post-content-container1-${postsArrId}" id="post-${ postsArrId }" data-post-id="${postsArrId}" data-document-id=${postsArr[i].documentId}>
            <!-- Khối thông tin người đăng -->
            <div class="author-info">
                <div class="avatar-container image-container user-page" data-value="${ postsArr[i].createdBy }">
                    <!-- Avatar của người đăng -->
                    <img src="/userImg/${userCreate.profilePicture}" alt="Avatar">
                </div>
                ${postAuthorName}
                <div class="options">
                    <!-- Biểu tượng công khai -->
                    <div class="privacy-icon">
                        <i class="fa-solid fa-globe"></i>
                    </div>

                    <div class="dropdown-menu-post-container">
                        <!-- Biểu tượng dấu ba chấm -->
                        <i class="fa-solid fa-ellipsis-v fa-ellipsis-v-${ postsArrId }" data-post-id="${postsArrId}" data-post-user="${user._id}"></i>
                        <!-- Dropdown menu -->
                        <div class="dropdown-menu-post dropdown-menu-post-${ postsArrId }">
                            <ul>
                                <button id="update-post" data-value="${ postsArrId }" title="Cập nhật dữ liệu" class="btn update-btn btn-link"><i class="fa-solid fa-pen"></i></button>
                                <button onclick="deletePost('${ postsArrId }');" title="Xoá" class="btn delete-btn btn-link"><i class="fa-solid fa-trash"></i></button>
                            </ul>
                        </div>
                    </div>

                    
                </div>
            </div>
        
            <!-- Khối description và ảnh -->
            ${postDesImg}
        
            <!-- Khối like, comment, share -->
            <div class="interaction-buttons-${postsArrId}">
                <div class="like-count" data-post-id="${postsArrId}">
                    <i class="fa-solid fa-thumbs-up"></i> 
                    <span> ${likesPost.length} likes </span>
                    <div class="people-like people-like-${ postsArrId }">${peoplelikesPostList}</div>
                </div>
                <div class="interaction-buttons" data-post-id="${postsArrId}">
                    <!-- Nút like -->
                    <button class="like-button ${ likedClass }"><i class="fa-solid fa-thumbs-up"></i> Like</button>
                    <!-- Nút comment -->
                    <button class="comment-button"><i class="fa-solid fa-comment"></i> Comment</button>
                    <!-- Nút chia sẻ -->
                    <button class="share-button"><i class="fa-solid fa-share"></i> Share</button>
                </div>
            </div>
            <!-- Khối hiển thị comment -->
            <div class="comments-section">
                <div class="comment-input">
                    <div class="avatar-container user-page" data-value="${user._id} ">
                        <img src="/userImg/${user.profilePicture}" alt="Avatar">
                    </div>
                    <input type="text" class="comment-text" placeholder="Viết bình luận...">
                    <button class="send-comment-button"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
                <div class="comments comments-${ postsArrId }">
                    <!-- Các comment sẽ được hiển thị ở đây -->
                    ${commentHtml}
                </div>
            </div>
        </div>
    
        `
        // console.log("postContent", postContent)
        postContentContainer.innerHTML = postContent;
        
    }
    
}

function showNotificationList () {
    const currUserId = currUser._id
    //Lấy giá trị messages
    fetch('http://localhost:3000/api/notification', {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token,
            "userId" : currUserId,
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
        notificationsArr = result.notifications;
        console.log("notificationsArr",notificationsArr);
        // showMessList(messArr, currUserId, friendId);
        updateNotificationCount();
        notificationsArr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        showNotification1(notificationsArr);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function showNotification1(notificationsArr) {
    const listNotification = document.getElementById('notificationList');
    var notificationHTML = ``;

    if(!notificationsArr) {
        listNotification.innerHTML = `
        `;
    } 
    const length = notificationsArr.length;
    for (let i = 0; i < length; i++) {
        var notificationId = notificationsArr[i]._id;
        var initiatorId = notificationsArr[i].initiatorId;
        var initiatorUser = usersArr.find(user => user._id == initiatorId)
        var initiatorFullname = initiatorUser.fullname;
        // var targetId = notificationsArr[i].targetId;
        var type = notificationsArr[i].type;
        var link = notificationsArr[i].link;
        if (type == 'like'){
            notificationHTML += `
            <div class="notification-item notification-like notification-like-${link}" data-post-id="${link}" data-notification-id="${notificationId}">
                <span class="initiator-name">${initiatorFullname}</span> đã like bài viết của bạn
            </div>
            `
        }
        if (type == 'comment-like'){
            var comment = commentsArr.find(comment => comment._id == link);
            console.log("comment",comment)
            var postId = comment.postId;
            notificationHTML += `
            <div class="notification-item notification-comment-like notification-comment-like-${postId}" data-post-id="${postId}" data-notification-id="${notificationId}">
                <span class="initiator-name">${initiatorFullname}</span> đã like comment của bạn
            </div>
            `
        }
        if (type == 'comment'){
            var comment = commentsArr.find(comment => comment._id == link);
            // console.log("comment",comment)
            var postId = comment.postId;
            notificationHTML += `
            <div class="notification-item notification-comment notification-comment-${postId}" data-post-id="${postId}" data-notification-id="${notificationId}">
                <span class="initiator-name">${initiatorFullname}</span> đã comment bài viết của bạn
            </div>
            `
        }
        if (type == 'friend'){
            notificationHTML += `
            <div class="notification-item notification-friend notification-friend-${initiatorId}" data-friend-id="${initiatorId}" data-notification-id="${notificationId}">
                <span class="initiator-name">${initiatorFullname}</span> đã gửi lời mời kết bạn
            </div>
            `
        }
        listNotification.innerHTML = notificationHTML;
    }
}