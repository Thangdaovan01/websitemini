var posts = [];
var users = [];
var likesArr = [];
var user = {};
var photoValues1 = [];
var profilePicture2 = '';
var coverPicture2 = '';

const token = localStorage.getItem('jwtToken');

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
        console.log("users",users);
        posts = result.posts;
        likesArr = result.likes;
        // const imgElement = document.querySelector('.image-container img');
        // imgElement.src = `${user.profilePicture}`;
        showUser(user, users, posts);
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
                    <div class="user-avatar ">
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
                        <label for="image-upload">Chọn ảnh 123</label>
                        <input type="file" class="image-upload" id="image-upload" accept="image/*" multiple>
                        <div class="preview-images-post">
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

    $(document).on('click', '.post-button', async function(event) {
        event.stopPropagation();
        console.log('click .save-new-website')

        var $data = $(this).siblings('div');
        var description = $data.find('.description').val();
        var privacy = $data.find('#privacy').val();
       
        console.log("description", description);
        var photoValues = photoValues1;
        var videoValues = [];

        console.log("photoValues", photoValues1.length);
        // displayImage(photoValues[0]);
    
        if (description === '' && photoValues.length === 0 && videoValues.length === 0) {
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

    $(document).on('change','#image-upload', async function(event) {
        event.stopPropagation();
        console.log("ImageUrl image-upload");

        const file = event.target.files[0];

        if (file && file.type.startsWith('image/')) {
            try {
                const imageUrl = await fileReaderImage(file);
                console.log("ImageUrl:", imageUrl);
                photoValues1.push(imageUrl);
                displayImage(imageUrl);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else {
            showNotification('Vui lòng chọn một tệp ảnh hợp lệ.');
        }
        console.log("photoValues Change",photoValues1);

    })

    $(document).on('click', '.fa-ellipsis-v', function(event) {
        event.stopPropagation();
        console.log('click .fa-ellipsis-v')
        // console.log("user", user);
        
        const postId = this.getAttribute('data-post-id');
        const userId = this.getAttribute('data-post-user');

        var post1 = findObjectById(posts, postId )
        var userCreate = findObjectById(users, post1.createdBy )
        console.log("user", userCreate._id, userId);

        if(userCreate._id == userId){
            const dropdownMenu = document.querySelector(`.dropdown-menu-post-${postId}`);
       
            document.querySelectorAll('.dropdown-menu-post').forEach(item => {
                item.classList.remove('active');
            });
            dropdownMenu.classList.add('active');
        } else {
            showNotification("Bạn không thể chỉnh sửa bài viết này!");
        }
       
    }); 
    
    $(document).on('click', '#update-post', function(event) { 
        event.stopPropagation();
        console.log("Button clicked! #update-post", photoValues1);
        var postId = $(this).data('value');
        var post1 = findObjectById(posts, postId )
        var imageUrl = post1.photo[0];
        photoValues1 = post1.photo;

        console.log("imageUrl",imageUrl);
        $("body").children().not(".window, .notification").addClass("blur");

        var newPost = ``

        newPost += `
            
        <div class="post-form">
            <div class="post-form2" value="${postId}">

                <div class="post-form1">
                    <h3>Cập nhật bài đăng</h3>
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
                    <textarea class="description form-control" placeholder="Nhập nội dung bài viết">${post1.description}</textarea>
                    <div class="image-upload">
                        <label for="image-upload">Chọn ảnh</label>
                        <input type="file" class="image-upload" id="image-upload" accept="image/*" multiple>
                        <div class="preview-images-post">
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
            <button class="update-post-button">Lưu</button>
        </div>

        `
        $('.window').empty().append(newPost);
        if(imageUrl){
            console.log("Không in ra nha")
            displayImage(imageUrl);
        }
        $('.window').show();
    });

    $(document).on('click', '.update-post-button', async function(event) {
        event.stopPropagation();
        console.log('click .update-new')
        console.log("photoValues toàn cục", photoValues1);

        var $data = $(this).siblings('div');
        // console.log("$data", $data);
        // var id = $(this).siblings('div.website-name').attr('value');
        // var postId = $(this).data('value');
        var postId = $('.post-form2').attr('value');
        console.log("postId", postId);
        var post1 = findObjectById(posts, postId );
        var description = $data.find('.description').val();
        var privacy = $data.find('#privacy').val();
        
        // console.log("photoValues toàn cục", photoValues1);

        var videoValues = [];
        var photoValues = photoValues1;

        if (description == '' && photoValues.length == 0 && videoValues.length == 0) {
            showNotification('Hãy điền ít nhất 1 trường');
            return
        }
        
        var updatePost1 = {
            _id: postId,
            description: description,
            privacy: privacy,
            photo: photoValues,
            video: videoValues,
            createdBy: user._id,
            updatedBy: user._id,
        };
        console.log("updatePost1", updatePost1);

        if (!confirm('Cập nhật bài đăng')) {
            return
        }
        updatePost(updatePost1);
    }); 

    $(document).on('click', '.Xbuttonimage', function(event1) {
        event1.stopPropagation();
        console.log("Bấm vào nút X ở update");

        const imageContainer = $(this).closest('.image-container');
        const imgSrc = imageContainer.find('img').attr('src');

        // Xóa giá trị src khỏi mảng photoValues nếu tồn tại
        photoValues1 = photoValues1.filter(src => src !== imgSrc);
        console.log("photoValues toàn cục", photoValues1);
        coverPicture='';
        profilePicture='';
        // Xóa khối div image-container
        imageContainer.remove();
        const input = document.getElementById('image-upload');
        input.value = '';
    });
    

    $(document).on('click', '.user-page', function(event) { 
        event.stopPropagation();
        var id = $(this).data('value');
        console.log("id",id);
        window.location.href = 'http://localhost:3000/user?id='+id;
    });

    // document.getElementById('imageUploadForm').addEventListener('submit', async function(event) {
    //     event.preventDefault();

    //     // Lấy tệp ảnh từ input
    //     const fileInput = document.getElementById('imageFile');
    //     const file = fileInput.files[0];
    //     console.log("file",file);
        
    //     fileReaderImage(file)
    //     .then(imageUrl => {
    //         console.log("ImageUrl", imageUrl);
    //         // Ở đây bạn có thể thực hiện các thao tác tiếp theo với imageUrl
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //     });
    // });

    // document.getElementById('image-upload').addEventListener('change', async function(event) {
    //     const file = event.target.files[0];
    //     console.log("file",file);

    //     if (!file) {
    //         return;
    //     }

    //     try {
    //         const cloudinaryResponse = await uploadToCloudinary(file);
    //         const imageUrl = cloudinaryResponse.secure_url;
    //         console.log("imageUrl",imageUrl);
    //         displayImage(imageUrl);
    //     } catch (error) {
    //         console.error('Error uploading image to Cloudinary:', error);
    //     }
    // });

    $(document).on('click', function(event) {
        // Kiểm tra nếu click vào phần tử không phải là .create-row-container hoặc các phần tử con của nó
        if (!$(event.target).closest('.window').length && !$(event.target).is('.Xbuttonimage')) {
            // Ẩn đi phần tử .window
            $('.window').hide();
            $("body").children().removeClass("blur");

        }
    });

    $(document).on('click', '.edit-info-btn', function(event) { 
        event.stopPropagation();
        console.log("CHỈNH SỬA THÔNG TIN");
        console.log("profilePicture toàn cục", profilePicture2);
        console.log("coverPicture toàn cục", coverPicture2);

        profilePicture2 = user.profilePicture;
        coverPicture2 = user.coverPicture;
        // console.log("profilePicture",profilePicture2);
        // console.log("coverPicture",coverPicture2);
        var birthday = formatDate2(user.birthday);
 
        $("body").children().not(".window, .notification").addClass("blur");

        var editInfoHtml = ``

        editInfoHtml += `
            
        <div class="post-form">
            <div class="post-form2">
                <div class="post-form1">
                    <h3>Chỉnh sửa thông tin cá nhân</h3>
                    <div class="form-group update-fullname">
                        <label for="fullname">Họ và tên</label>
                        <input type="text" class="form-control" name="" id="fullname" value="${user.fullname}">
                    </div>
                    <div class="form-group update-bio">
                        <label for="bio">Thông tin giới thiệu</label>
                        <textarea class="form-control" id="bio" name="bio" value="${user.bio}">${user.bio}</textarea>
                    </div>

                    <div class="form-group update-birthday">
                        <label for="birthday">Sinh nhật</label>
                        <input type="date" class="form-control" name="" id="birthday" value="${birthday}">
                    </div>

                    <div class="gender-options">
                        <label for="gender">Giới tính</label>
                        <select id="gender">
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                </div>
                
                <div class="post-content">
                    <div class="image-upload">
                        <label for="profile-image-upload">Chọn ảnh đại diện</label>
                        <input type="file" class="profile-image-upload" id="profile-image-upload" accept="image/*" multiple>
                        <div class="preview_profile_picture">
                        </div>
                    </div>
                    <div class="image-upload">
                        <label for="cover-image-upload">Chọn ảnh bìa</label>
                        <input type="file" class="cover-image-upload" id="cover-image-upload" accept="image/*" multiple>
                        <div class="preview_cover_picture">
                            <!-- Hiển thị ảnh được tải lên -->
                        </div>
                    </div>
                    
                </div>


            </div>
            <button class="update-info-button">Lưu</button>
        </div>

        `

        $('.window').empty().append(editInfoHtml);
        if(user){
            console.log("Không in ra nha")
            displayImage1(user.profilePicture, 'preview_profile_picture');
            displayImage1(user.coverPicture, 'preview_cover_picture');
        }
        $('.window').show();
    });

    $(document).on('click', '.update-info-button', async function(event) {
        event.stopPropagation();
        console.log('click .update-info-button')
        console.log("profilePicture toàn cục", profilePicture2);
        console.log("coverPicture toàn cục", coverPicture2);

        var $data = $(this).siblings('div');
        
        var fullname = $data.find('#fullname').val();
        var bio = $data.find('#bio').val();
        var birthday = $data.find('#birthday').val();
        var gender = $data.find('#gender').val();
        var profilePicture1 = '';
        var coverPicture1 = '';

        if(profilePicture2){
            profilePicture1 = profilePicture2;
        } else {
            profilePicture1 = 'https://i.pinimg.com/564x/29/b8/d2/29b8d250380266eb04be05fe21ef19a7.jpg';
        }

        if(coverPicture2){
            coverPicture1 = coverPicture2;
        } else {
            coverPicture1 = 'https://www.trendycovers.com/covers/Nothing_Here_facebook_cover_1346610160.jpg';
        }
        var updateInfo1 = {
            _id: user._id,
            fullname: fullname,
            profilePicture: profilePicture1,
            coverPicture: coverPicture1,
            bio: bio,
            gender: gender,
            birthday: birthday,
        };
        console.log("updateInfo1", updateInfo1);

        if (!confirm('Cập nhật thông tin người dùng')) {
            return
        }
        updateInfo(updateInfo1);
    });
    
    $(document).on('change','#profile-image-upload', async function(event) {
        event.stopPropagation();
        console.log("ImageUrl #profile-image-upload");

        console.log("profilePicture toàn cục profile", profilePicture2);
        console.log("coverPicture toàn cục profile", coverPicture2);
        const file = event.target.files[0];

        if (file && file.type.startsWith('image/')) {
            try {
                const imageUrl = await fileReaderImage(file);
                console.log("ImageUrl profilePicture:", imageUrl);
                profilePicture2 = imageUrl;
                displayImage1(imageUrl, 'preview_profile_picture');
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else {
            showNotification('Vui lòng chọn một tệp ảnh hợp lệ.');
        }
    })

    $(document).on('change','#cover-image-upload', async function(event) {
        event.stopPropagation();
        console.log("ImageUrl #cover-image-upload");
        console.log("profilePicture toàn cục cover", profilePicture2);
        console.log("coverPicture toàn cục cover", coverPicture2);
        const file = event.target.files[0];

        if (file && file.type.startsWith('image/')) {
            try {
                const imageUrl = await fileReaderImage(file);
                console.log("ImageUrl: coverPicture", imageUrl);
                coverPicture2 = imageUrl;
                displayImage1(imageUrl, 'preview_cover_picture');
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else {
            showNotification('Vui lòng chọn một tệp ảnh hợp lệ.');
        }
    })

    $(document).on('mouseover','.post-create1',  function(event) {
        event.stopPropagation();
        // console.log("mouseover");
        const postId = this.getAttribute('data-post-id');
        const tooltips = document.querySelectorAll(`.tooltip1-${postId}`);
        
        tooltips.forEach(tooltip => {
            tooltip.classList.add('active');
        });
        
    })

    $(document).on('mouseout','.post-create',  function(event) {
        event.stopPropagation();
        const tooltips = document.querySelectorAll('.tooltip1');

        tooltips.forEach(tooltip => {
            tooltip.classList.remove('active'); 
        });
    })

    $(document).on('click','.like-button',  function(event) {
        event.stopPropagation();
        const postId = $(this).closest('.interaction-buttons').data('post-id');
        const likesPost = likesArr.filter(item => item.likePostId == postId);
        let totalLikes = likesPost.length;
        console.log("totalLikes click",totalLikes)
        $(this).toggleClass('liked');
        const likeCount = document.querySelector('.like-count');
        // const likeCountElement = document.querySelector(`.interaction-buttons-${postId} .like-count span`);
        // likeCountElement.textContent = totalLikes + ' likes';
        
        
        if ($(this).hasClass('liked')) {
            totalLikes++;
            const createLike1 = {
                userId: user._id,
                likePostId: postId,
            }
            createLike(createLike1, totalLikes);
        } else {
            totalLikes--;
            const deleteLike1 = {
                userId: user._id,
                likePostId: postId,
            }
            deleteLike(deleteLike1, totalLikes);
        }
        // likeCount.querySelector('span').textContent = totalLikes + ' likes';
        // likeCountElement.textContent = totalLikes + ' likes';

        
    })
    

});

async function fileReaderImage(file) {
    console.log("fileReaderImage");
    return new Promise((resolve, reject) => {
        // Tạo đối tượng FileReader
        const reader = new FileReader();
        console.log("reader",reader);

        // Xử lý sự kiện khi tệp ảnh được đọc thành công
        reader.onload = async function(event) {
            const imageDataUrl = event.target.result;
            // console.log("imageDataUrl",imageDataUrl)
            // Tải ảnh lên Cloudinary
            var fileimage = {
                imageUrl: imageDataUrl,
            };

            try {
                const response = await fetch('http://localhost:3000/api/upload', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(fileimage)
                });

                if (!response.ok) {
                    const data = await response.json();
                    showNotification(data.message);
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                resolve(result.imageUrl);
            } catch (error) {
                console.error('There was a problem with your fetch operation:', error);
                reject(error);
            }
        };

        // Xử lý sự kiện khi có lỗi xảy ra
        reader.onerror = function(error) {
            reject(error);
        };

        // Đọc tệp ảnh
        if (file instanceof Blob) {
            reader.readAsDataURL(file);
        } else {
            reject(new TypeError('The provided value is not a Blob.'));
        }
    });
}

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

async function showPost(posts) {
    // console.log(" showPost posts",posts);
    // console.log(" showPost user",user);

    var postContentContainer = document.querySelector('.post-content-container');
    var dataLength = posts.length;

    const divElement = document.querySelector('.image-container.user-page');

    if (divElement) {
        divElement.dataset.value = user._id;
    }

    var postContent = ``;
    for (let i = 0; i < dataLength; i++) {
        var userCreate = findObjectById(users, posts[i].createdBy )
        var postCreatedAt = formatDateAndTooltip1(posts[i].createdAt);
        var postCreatedAtTooltip = formatDateAndTooltip2(posts[i].createdAt);
        const likesPost = likesArr.filter(item => item.likePostId == posts[i]._id);

        console.log("User showw", user._id); 
        console.log("likesPost showw", likesPost);
        
        // if (likesPost.length > 0) {
        //     $likeButtonElement.addClass('liked');
        // }
        // const likeCountElement = document.querySelector(`.interaction-buttons-${postId} .like-count span`);
         
        postContent += `
        <div class="post-content-container1" id="post-${ posts[i]._id }">
            <!-- Khối thông tin người đăng -->
            <div class="author-info">
                <div class="avatar-container image-container user-page" data-value="${ posts[i].createdBy }">
                    <!-- Avatar của người đăng -->
                    <img src="${userCreate.profilePicture}" alt="Avatar">
                </div>
                <div>
                    <div class="author-name user-page" data-value="${ posts[i].createdBy }">
                        ${userCreate.fullname}
                    </div>
                    <div class="post-create" id="date-containers" data-value="${ posts[i]._id }">
                        <span class="post-create1 post-create-${ posts[i]._id }" data-post-id="${posts[i]._id}">${ postCreatedAt }</span>
                        <div class="tooltip1 tooltip1-${ posts[i]._id }"> <span>${postCreatedAtTooltip}</span></div>
                    </div>
                    
                </div>
                <div class="options">
                    <!-- Biểu tượng công khai -->
                    <div class="privacy-icon">
                        <i class="fa-solid fa-globe"></i>
                    </div>

                    <div class="dropdown-menu-post-container">
                        <!-- Biểu tượng dấu ba chấm -->
                        <i class="fa-solid fa-ellipsis-v fa-ellipsis-v-${ posts[i]._id }" data-post-id="${posts[i]._id}" data-post-user="${user._id}"></i>
                        <!-- Dropdown menu -->
                        <div class="dropdown-menu-post dropdown-menu-post-${ posts[i]._id }">
                            <ul>
                                <button id="update-post" data-value="${ posts[i]._id }" title="Cập nhật dữ liệu" class="btn update-btn btn-link"><i class="fa-solid fa-pen"></i></button>
                                <button onclick="deletePost('${ posts[i]._id }');" title="Xoá" class="btn delete-btn btn-link"><i class="fa-solid fa-trash"></i></button>
                            </ul>
                        </div>
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
                        <img src="${posts[i].photo[0]}" alt="">
                    </div>
                </div>
            </div>
        
            <!-- Khối like, comment, share -->
            <div class="interaction-buttons-${posts[i]._id}">
                <div class="like-count">
                    <i class="fa-solid fa-thumbs-up"></i> 
                    <span> ${likesPost.length} likes </span>
                </div>
                <div class="interaction-buttons" data-post-id="${posts[i]._id}">
                    <!-- Nút like -->
                    <button class="like-button"><i class="fa-solid fa-thumbs-up"></i> Like</button>
                    <!-- Nút comment -->
                    <button class="comment-button"><i class="fa-solid fa-comment"></i> Comment</button>
                    <!-- Nút chia sẻ -->
                    <button class="share-button"><i class="fa-solid fa-share"></i> Share</button>
                </div>
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
        postContentContainer.innerHTML = postContent;

        const likeButtonElement = document.querySelector(`.interaction-buttons-${posts[i]._id} .interaction-buttons .like-button`);
        // const $likeButtonElement = $(`.interaction-buttons-${posts[i]._id} .interaction-buttons .like-button`);
        const isExist = likesPost.some(item => item.userId == user._id);
        
        // console.log('likeButtonElement', likeButtonElement.outerHTML);

        if (isExist) {
            console.log('UserID tồn tại trong mảng.');
            likeButtonElement.classList.add('liked');
        // console.log('likeButtonElement after', likeButtonElement.outerHTML);

            // $likeButtonElement.addClass('liked');
        } else {
            console.log('UserID không tồn tại trong mảng.');
        }
    }
    // postContentContainer.innerHTML += postContent;

}

async function showUser(user, users, posts){
    const imgElement = document.querySelector('.image-container img');
    imgElement.src = `${user.profilePicture}`;

    // console.log('User:', user);
    // console.log('Users Aray:', users);
    // console.log('Posts Array:', posts);

    var userId = getQueryParam('id');
    // console.log('User ID:', userId, user._id);

    var UserProfile = findObjectById(users, userId);
    
    if (userId === user._id) {
        document.querySelector('.add-friend-btn').classList.add('hidden');
        document.querySelector('.edit-info-btn').classList.remove('hidden');
        document.querySelector('.post-header-container').classList.remove('hidden');

    } else {
        document.querySelector('.add-friend-btn').classList.remove('hidden');
        document.querySelector('.edit-info-btn').classList.add('hidden');
        document.querySelector('.post-header-container').classList.add('hidden');

    }

    const coverPhotoElement = document.querySelector('.profile-container .cover-photo img');
    if(UserProfile.coverPicture){
        coverPhotoElement.src = `${UserProfile.coverPicture}`;
    } else {
        coverPhotoElement.src = 'https://www.trendycovers.com/covers/Nothing_Here_facebook_cover_1346610160.jpg';
    }

    const avatarPhotoElement = document.querySelector('.profile-container .user-info .avatar img');
    if(UserProfile.profilePicture){
        avatarPhotoElement.src = `${UserProfile.profilePicture}`;
    } else {
        avatarPhotoElement.src = 'https://i.pinimg.com/564x/29/b8/d2/29b8d250380266eb04be05fe21ef19a7.jpg';
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

        showUserPost(user, UserProfile, posts);
}

async function showUserPost(currUser, user, posts) {
    // console.log(" showPost posts",posts);
    // console.log(" showPost user",user);

    const postsUser = posts.filter(item => item.createdBy === user._id);
    console.log(" showPost ",postsUser);

    var postContentContainer = document.querySelector('.user-posts-section');
    var dataLength = postsUser.length;
    

    var postContent = ``;
    for (let i = 0; i < dataLength; i++) {
        var postCreatedAt = formatDateAndTooltip1(postsUser[i].createdAt);
        var postCreatedAtTooltip = formatDateAndTooltip2(postsUser[i].createdAt);
        
        postContent += `
        <div class="post-content-container1 post" id="post-${ postsUser[i]._id }">
            <!-- Khối thông tin người đăng -->
            <div class="author-info">
                <div class="avatar-container image-container user-page" data-value="${ postsUser[i].createdBy }">
                    <!-- Avatar của người đăng -->
                    <img src="${user.profilePicture}" alt="Avatar">
                </div>
                <div>
                    <div class="author-name user-page" data-value="${ postsUser[i].createdBy }">
                        ${user.fullname}
                    </div>
                    <div class="post-create" id="date-containers" data-value="${ postsUser[i]._id }">
                        <span class="post-create1 post-create-${ postsUser[i]._id }" data-post-id="${postsUser[i]._id}">${ postCreatedAt }</span>
                        <div class="tooltip1 tooltip1-${ postsUser[i]._id }"> <span>${postCreatedAtTooltip}</span></div>
                    </div>
                    
                </div>

                <div class="options">
                    <!-- Biểu tượng công khai -->
                    <div class="privacy-icon">
                        <i class="fa-solid fa-globe"></i>
                    </div>

                    <div class="dropdown-menu-post-container">
                        <!-- Biểu tượng dấu ba chấm -->
                        <i class="fa-solid fa-ellipsis-v fa-ellipsis-v-${ postsUser[i]._id }" data-post-id="${postsUser[i]._id}" data-post-user="${currUser._id}"></i>
                        <!-- Dropdown menu -->
                        <div class="dropdown-menu-post dropdown-menu-post-${ postsUser[i]._id }">
                            <ul>
                                <button id="update-post" data-value="${ postsUser[i]._id }" title="Cập nhật dữ liệu" class="btn update-btn btn-link"><i class="fa-solid fa-pen"></i></button>
                                <button onclick="deletePost('${ postsUser[i]._id }');" title="Xoá" class="btn delete-btn btn-link"><i class="fa-solid fa-trash"></i></button>
                            </ul>
                        </div>
                    </div>

                    
                </div>
            </div>
        
            <!-- Khối description và ảnh -->
            <div class="post-content">
                <!-- Description -->
                <span class="description">${postsUser[i].description}</span>
                <!-- Ảnh -->
                <div class="image-upload">
                    
                    <!-- Hiển thị ảnh được tải lên -->
                    <div class="preview-images">
                        <img src="${postsUser[i].photo[0]}" alt="">
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
                        <img src="${currUser.profilePicture}" alt="Avatar">
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

function getQueryParam(param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
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

async function deletePost(idPost) {
    if(confirm("confirm delete")){
        fetch(`http://localhost:3000/api/post`, {
            method: 'DELETE',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({ idPost: idPost })
        })
        .then(response => {
            if(!response.ok){
                throw new Error("Network response not ok!");
            }
            return response.json();
        })
        .then(result =>{
            console.log(result);

            $(`#post-${idPost}`).remove();
            console.log(result);
            alert("Deleted");
        })
    }
}

function updatePost (updatePost) {
    console.log("UPDATE");

    fetch('http://localhost:3000/api/post', {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body:JSON.stringify(updatePost)
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

function updateInfo (updateInfo) {
    console.log("UPDATE");

    fetch('http://localhost:3000/api/userprofile', {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body:JSON.stringify(updateInfo)
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
            window.location.href = 'http://localhost:3000/user?id='+updateInfo._id;
        }, 500);
    
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function findObjectById(array, id) {
    return array.find(item => item._id === id);
}

function displayImage(imageUrl) {
    console.log("displayImage PHOTOVALUE", photoValues1);
    // Tạo một thẻ <img> mới
    const img = document.createElement('img');
    // Đặt thuộc tính src của <img> là URL của ảnh
    img.src = imageUrl;
    // Đặt kích thước cho ảnh (có thể thay đổi tùy ý)
    img.style.maxWidth = '100px';
    img.style.maxHeight = '100px';

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('Xbuttonimage');
    // Thêm nội dung cho nút "X" (có thể sử dụng ký hiệu X hoặc biểu tượng X)
    deleteButton.textContent = 'X';

    // Sự kiện click vào nút "X" để xóa ảnh
    // deleteButton.addEventListener('click', function() {
    //     console.log("Bấm vào nút X ở bên dưới");

    //     imageContainer.remove();
    //     const input = document.getElementById('image-upload');
    //     photoValues = photoValues.filter(src => src !== imageUrl);
    //     input.value = '';
    // });

    // Thêm thẻ <img> và nút "X" vào khối <div> chứa ảnh
    imageContainer.appendChild(img);
    imageContainer.appendChild(deleteButton);

    // Chèn khối <div> chứa ảnh và nút "X" vào khối "preview-images"
    const previewContainer = document.querySelector('.preview-images-post');
    previewContainer.appendChild(imageContainer);
}

function displayImage1(imageUrl, className) {
    // console.log("displayImage PHOTOVALUE", photoValues1);
    const img = document.createElement('img');
    img.src = imageUrl;
    // Đặt kích thước cho ảnh (có thể thay đổi tùy ý)
    img.style.maxWidth = '100px';
    img.style.maxHeight = '100px';

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('Xbuttonimage');
    // Thêm nội dung cho nút "X" (có thể sử dụng ký hiệu X hoặc biểu tượng X)
    deleteButton.textContent = 'X';

    // Thêm thẻ <img> và nút "X" vào khối <div> chứa ảnh
    imageContainer.appendChild(img);
    imageContainer.appendChild(deleteButton);

    // Chèn khối <div> chứa ảnh và nút "X" vào khối "preview-images"
    const previewContainer = document.querySelector(`.${className}`);
    previewContainer.appendChild(imageContainer);
}

function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = date.getUTCDate(); // Lấy ngày
    const month = date.getUTCMonth() + 1; // Lấy tháng (tháng bắt đầu từ 0)
    const year = date.getUTCFullYear(); // Lấy năm

    // Định dạng lại ngày tháng theo dd/mm/yyyy
    return `${day}/${month}/${year}`;
}

function formatDate2(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}

function formatDateAndTooltip1(dateStr) {
    const date = new Date(dateStr);

    // Chuyển đổi ngày tháng sang định dạng "11 Tháng 5"
    const day = date.getDate();
    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    const month = monthNames[date.getMonth()];
    const formattedDate = `${day} ${month}`;

    return formattedDate;
}

function formatDateAndTooltip2(dateStr) {
    const date = new Date(dateStr);

    // Chuyển đổi ngày tháng sang định dạng "11 Tháng 5"
    const day = date.getDate();
    // const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    //                     "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    // const month = monthNames[date.getMonth()];
    // const formattedDate = `${day} ${month}`;

    // Chuyển đổi ngày tháng sang định dạng chi tiết cho tooltip
    const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const dayOfWeek = daysOfWeek[date.getDay()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const detailedDate = `${dayOfWeek}, ngày ${day} tháng ${date.getMonth() + 1}, ${year} vào lúc ${hours}:${minutes}`;

    // Tạo chuỗi HTML
    return detailedDate;
}


function createLike (createLike, totalLikes) {
    console.log("totalLikes",totalLikes);

    fetch('http://localhost:3000/api/like', {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body:JSON.stringify(createLike)
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
        const likeCountElement = document.querySelector(`.interaction-buttons-${createLike.likePostId} .like-count span`);
        likeCountElement.textContent = totalLikes + ' likes';
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

}

async function deleteLike(deleteLike, totalLikes) {
    // if(confirm("confirm delete")){
    console.log("deleteLike",deleteLike);

        fetch(`http://localhost:3000/api/like`, {
            method: 'DELETE',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(deleteLike)
        })
        .then(response => {
            if(!response.ok){
                throw new Error("Network response not ok!");
            }
            return response.json();
        })
        .then(result =>{
            
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    // }
}