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

 