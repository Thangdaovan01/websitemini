var posts = [];
var users = [];
var user = {};
const token = localStorage.getItem('jwtToken');
// const jwt = require('jsonwebtoken');

// const { generateToken, decodeToken } = require('../../middleware/authentication');


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
                throw new Error('Network response was not ok');
            }
            return data;
        });
    })
    .then(result => {
        user = result.user;
        users = result.users;
        console.log("users",users);
        posts = result.posts;

        const imgElement = document.querySelector('.image-container img');
        imgElement.src = `${user.profilePicture}`;

        showPost(posts);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
   
    $('#search_form').submit(function(event){
        event.preventDefault();
        key = $('#search_form input[type="text"]').val().toLowerCase();
        console.log(key);
        search(key);
        $('#search_form input[type="text"]').val('');

    });


    const imgElement = document.querySelector('.image-container img');

    imgElement.src = `${user.profilePicture}`;

    $(document).on('click', '.input-container, .create-post-image-btn, .create-post-video-btn', function(event) { 
        event.stopPropagation();
        // console.log("Button clicked!");
        // console.log(decodeToken(token));
        // console.log(token);

        // var uniqueWebsites = styles.filter((item, index, array) => array.findIndex(i => i.website === item.website) === index)
        //                      .map(item => item.website);

        $("body").children().not(".window, .notification").addClass("blur");

        var newPost = ``

        newPost += `
            
        <div class="post-form">
            <div class="post-form2">
                <div class="post-form1">
                    <h3>Thêm bài đăng</h3>
                    <div class="user-avatar">
                        <!-- Avatar của người dùng -->
                        <img src="${user.profilePicture}" alt="User Avatar">
                    </div>
                    <h6>${user.fullname}</h6>
                    <div class="privacy-options">
                        <label for="privacy">Chọn quyền riêng tư:</label>
                        <select id="privacy">
                            <option value="public">Công khai</option>
                            <option value="only">Một mình tôi</option>
                            <option value="friend">Bạn bè</option>
                        </select>
                    </div>
                </div>
                
                <div class="post-content">
                    <textarea class="description form-control" placeholder="Nhập nội dung bài viết"></textarea>
                    <div class="image-upload">
                        <label for="image-upload">Chọn ảnh</label>
                        <input type="file" class="image-upload" id="image-upload" accept="image/*" multiple>
                        <div class="preview-images">
                            <!-- Hiển thị ảnh được tải lên -->
                        </div>
                    </div>
                    <div class="video-upload">
                        <label for="video-upload">Chèn video</label>
                        <input type="file" id="video-upload" accept="video/*" multiple>
                        <!-- Hiển thị video được tải lên -->
                    </div>
                    
                </div>


            </div>
            <button class="post-button">Đăng</button>
        </div>

        `

        $('.window').empty().append(newPost);
        $('.window').show();
    });

    $(document).on('click', '.post-button', function(event) {
        event.stopPropagation();
        console.log('click .save-new-website')

        var $data = $(this).siblings('div');
        // console.log("$data", $data);
        
        
        var description = $data.find('.description').val();
        var privacy = $data.find('#privacy').val();
        // var platform = $data.find('#platform').val().trim();
        // var type = getTypeFromWebsite(website, styles);
        
        console.log("description", description);
        console.log("privacy", privacy);


        // Khởi tạo hai mảng để lưu giá trị
        var photoValues = [];
        var videoValues = [];

        // Trích xuất dữ liệu từ các cặp input trong .demo-container
        $data.find('#image-upload').each(function() {
            photoValues.push($(this).val());
        });

        $data.find('#video-upload').each(function() {
            videoValues.push($(this).val());
        });
        console.log("photoValues", photoValues);
        console.log("videoValues", videoValues);

    
        if (description == '' || photoValues.length == 0 || videoValues.length == 0) {
            showNotification('Hãy điền ít nhất 1 trường');
            return
        }
        
        if (!confirm('Tạo bài đăng')) {
            return
        }
        
        var newPost = {
            description: description,
            privacy: privacy,
            photo: photoValues,
            video: videoValues,
            createdBy: user._id,

        };


        creatNewPost(newPost);
    }); 

    $(document).on('click', function(event) {
        // Kiểm tra nếu click vào phần tử không phải là .create-row-container hoặc các phần tử con của nó
        if (!$(event.target).closest('.window').length) {
            // Ẩn đi phần tử .window
            $('.window').hide();
            $("body").children().removeClass("blur");

        }
    });


});


// async function showData(excels) {
//     const uniqueTypes = [...new Set(excels.map(item => item.type))];
    
//     for(let i=0; i<uniqueTypes.length;i++){
//         if(uniqueTypes[i]==1){
//             let table_1 = excels.filter(item => item.type === 1);
//             showData1(table_1);
//         }
//         if(uniqueTypes[i]==2){
//             let table_2 = excels.filter(item => item.type === 2);
//             showData2(table_2);
//         }
//         if(uniqueTypes[i]==3){
//             let table_3 = excels.filter(item => item.type === 3);
//             showData3(table_3);
//         }
//         if(uniqueTypes[i]==4){
//             let table_4 = excels.filter(item => item.type === 4);
//             showData4(table_4);
//         }
//         if(uniqueTypes[i]==5){
//             let table_5 = excels.filter(item => item.type === 5);
//             showData5(table_5);
//         }
//     }
// }





function search (value) {
    

    fetch(`http://localhost:3000/api/row?key=${ value }`, {
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
                    throw new Error('Network response was not ok');
                }
                return data;
            });
        })
        .then(result => {
            var data = result;
            console.log("data",data);
            $(".table").each(function() {
                $(this).find("thead").empty();
                $(this).find("tbody").empty();
                $(this).find("tfoot").empty();
            });
            showData(data);
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    
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

function creatNewPost (newPost) {
    // console.log("token",token);
    fetch('http://localhost:3000/api/post', {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body:JSON.stringify(newPost)
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
        showNotification(result.message);

        setTimeout(function() {
            window.location.href = 'http://localhost:3000/';
        }, 500);
    
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

}

async function showPost(posts) {
    console.log("posts",posts);
    //sắp xếp post theo thứ tự thời gian
    // const uniqueTypes = [...new Set(excels.map(item => item.type))];

    var postContentContainer = document.querySelector('.post-content-container');
    var dataLength = posts.length;

    var postContent = ``;
    for (let i = 0; i < dataLength; i++) {
        var userCreate = findObjectById(users, posts[i].createdBy )
        // console.log("userCreate", userCreate)
        postContent += `
        <div class="post-content-container1">
            <!-- Khối thông tin người đăng -->
            <div class="author-info">
                <div class="avatar-container image-container">
                    <!-- Avatar của người đăng -->
                    <img src="${userCreate.profilePicture}" alt="Avatar">
                </div>
                <div class="author-name">
                    ${userCreate.fullname}
                </div>
                <div class="options">
                    <!-- Biểu tượng công khai -->
                    <div class="privacy-icon">
                        <i class="fa-solid fa-globe"></i>
                    </div>
                    <!-- Biểu tượng dấu ba chấm -->
                    <i class="fa-solid fa-ellipsis-v"></i>
                    <!-- Dropdown menu -->
                    <div class="dropdown-menu">
                        <ul>
                            <li><a href="#">Sửa</a></li>
                            <li><a href="#">Xoá</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        
            <!-- Khối description và ảnh -->
            <div class="post-content">
                <!-- Description -->
                <span class="description">${posts[i].description}</span>
                <!-- Ảnh -->
                <div class="image-upload">
                    
                    <!-- Hiển thị ảnh được tải lên -->
                    <div class="preview-images">
                        <img src="https://hoanghamobile.com/tin-tuc/wp-content/uploads/2023/07/anh-dep-thien-nhien-2-1.jpg" alt="">
                    </div>
                </div>
            </div>
        
            <!-- Khối like, comment, share -->
            <div class="interaction-buttons">
                <!-- Nút like -->
                <button class="like-button"><i class="fa-solid fa-thumbs-up"></i> Like</button>
                <!-- Nút comment -->
                <button class="comment-button"><i class="fa-solid fa-comment"></i> Comment</button>
                <!-- Nút chia sẻ -->
                <button class="share-button"><i class="fa-solid fa-share"></i> Share</button>
            </div>
        
            <!-- Khối hiển thị comment -->
            <div class="comments-section">
                <!-- Ô input comment -->
                <div class="comment-input">
                    <!-- Avatar của người comment -->
                    <div class="avatar-container">
                        <img src="${user.profilePicture}" alt="Avatar">
                    </div>
                    <!-- Ô input comment -->
                    <input type="text" class="comment-text" placeholder="Viết bình luận...">
                    <!-- Icon gửi comment -->
                    <button class="send-comment"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
                <!-- Các comment -->
                <div class="comments">
                    <!-- Các comment sẽ được hiển thị ở đây -->
                </div>
            </div>
        </div>
    
        `
        // console.log("postContent", postContent)

    }
    postContentContainer.innerHTML += postContent;

}

function findObjectById(array, id) {
    return array.find(item => item._id === id);
}

