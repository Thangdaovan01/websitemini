var postPage = {};
var postPageArr = [];

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
        // if(imgElement){
        //     imgElement.src = `/userImg/${user.profilePicture}`;
        // }
        
        // const headerContainer = document.querySelector('.header-container');
        // // Thêm giá trị vào thuộc tính data-user-id
        // if (headerContainer) {
        // headerContainer.dataset.userId = user._id;
        // }

        const currentURL = window.location.href;
        if (currentURL === 'http://localhost:3000/' || currentURL === 'http://localhost:3000') {
            showPost(posts, 'post-content-container');
        }

        fetchPost()
       
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
    
})

async function fetchPost() { 
    const path = window.location.pathname;
    const postId = path.split('/').pop();
    console.log("postId",postId)
    
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
        postPage = result.post;
        console.log("postPage", postPage)
        postPageArr.push(postPage)
        // showPostPage (postPage);
        // var postContentContainer = document.querySelector(`.post-content-container`);
        showPost(postPageArr, 'post-container');
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

}

function showPostPage (postPage) {
    var postContentContainer = document.querySelector(`.post-content-container`);
}