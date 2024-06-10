var posts = [];
var users = [];
var likesArr = [];
var commentsArr = [];
var friendsArr = [];
var user = {};
var photoValues1 = [];
var profilePicture2 = '';
var coverPicture2 = '';
var userImageFileName = '';
var postImageFileName = '';

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
        posts = result.posts;
        likesArr = result.likes;
        commentsArr = result.comments;
        friendsArr = result.friends;
        const imgElement = document.querySelector('.image-container img');
        imgElement.src = `/userImg/${user.profilePicture}`;
        
        const headerContainer = document.querySelector('.header-container');
        // Thêm giá trị vào thuộc tính data-user-id
        if (headerContainer) {
        headerContainer.dataset.userId = user._id;
        }
       
        showPost(posts, 'post-content-container');
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
})

$(document).ready(function() {
    $(document).on('click', '.messages-btn', function(event) { 
        event.stopPropagation();
        window.location.href = 'http://localhost:3000/message';
    });

    //Chưa làm
    $('#search_form').submit(function(event){
        event.preventDefault();
        key = $('#search_form input[type="text"]').val().toLowerCase();
        console.log(key);
        search(key);
        $('#search_form input[type="text"]').val('');

    });

    $(document).on('click', '.input-container, .create-post-image-btn, .create-post-video-btn', function(event) { 
        event.stopPropagation();
        
        $("body").children().not(".window, .notification").addClass("blur");

        var newPost = ``

        newPost += `
            
        <div class="post-form">
            <div class="post-form2">
                <div class="post-form1">
                    <h3>Thêm bài đăng</h3>
                    <div class="user-avatar ">
                        <!-- Avatar của người dùng -->
                        <img src="/userImg/${user.profilePicture}" alt="User Avatar">
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
                </div>
            </div>
            <button class="post-button">Đăng</button>
        </div>

        `

        $('.window').empty().append(newPost);
        $('.window').show();
    });

    $(document).on('click', '.create-file-btn', function(event) { 
        event.stopPropagation();
        
        $("body").children().not(".window, .notification").addClass("blur");

        var newPost = ``

        newPost += `
            
        <div class="form-container">
            <form id="create_new_document_form" enctype="multipart/form-data">
                <div class="form-section">
                    <div class="box small-box">
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" required>
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" rows="4" required></textarea>
                        </div>
                    </div>
                    <div class="box small-box">
                        <div class="form-group">
                            <label for="document">Upload Document</label>
                            <input type="file" id="document" name="document" accept=".pdf,.doc,.docx" required><br>
                        </div>
                        <div class="form-group">
                            <label for="document-image">Upload Document Image</label>
                            <input type="file" id="document-image" name="document-image" accept=".png,.jpg,.jpeg" required>
                        </div>
                        <div class="form-group">
                            <label for="school">Select School</label>
                            <select id="school" name="school">
                                <option value="Trường Cơ khí">Trường Cơ khí</option>
                                <option value="Trường Công nghệ Thông tin và Truyền thông">Trường Công nghệ Thông tin và Truyền thông</option>
                                <option value="Trường Điện - Điện tử">Trường Điện - Điện tử</option>
                                <option value="Trường Hoá và Khoa học sự sống">Trường Hoá và Khoa học sự sống</option>
                                <option value="Trường Vật liệu">Trường Vật liệu</option>
                                <option value="Khoa Toán - Tin">Khoa Toán - Tin</option>
                                <option value="Khoa Vật lý Kỹ thuật">Khoa Vật lý Kỹ thuật</option>
                                <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
                                <option value="Khoa Khoa học và Công nghệ Giáo dục">Khoa Khoa học và Công nghệ Giáo dục</option>
                                <option value="Khoa Giáo dục Quốc phòng & An ninh">Khoa Giáo dục Quốc phòng & An ninh</option>
                                <option value="Khoa Lý luận Chính trị">Khoa Lý luận Chính trị</option>
                                <option value="Khoa Giáo dục Thể chất">Khoa Giáo dục Thể chất</option>
                                <option value="Viện Kinh tế và Quản lý">Viện Kinh tế và Quản lý</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="subject">Subject Name</label>
                            <input type="text" id="subject" name="subject">
                        </div>
                    </div>
                </div>
                <div class="form-section">
                    <button type="button" class="btn cancel create-new-document-cancel-btn"><i class="fa-solid fa-xmark"></i> Cancel</button>
                    <button type="submit" class="btn submit create-new-document-submit-btn"><i class="fa-solid fa-arrow-up-from-bracket"></i> Upload Document</button>
                </div>
            </form>
        </div>

        `

        $('.window').empty().append(newPost);
        $('.window').show();
    });

    $(document).on('click', '.create-new-document-cancel-btn', function(event) {
        event.stopPropagation();
        $('.window').hide();
        $("body").children().removeClass("blur");
    })

    $(document).on('click', '.create-new-document-submit-btn', function(event) {
        event.stopPropagation();
        console.log("create-new-document-submit-btn");

        var title = document.getElementById('title').value;
        var description = document.getElementById('description').value;
        var school = document.getElementById('school').value;
        var subject = document.getElementById('subject').value;
        
        var newDocument = {
            document: documentFileName,
            documentImage: imageFileName,
            title: title,
            description: description,
            school: school,
            subject: subject,
        }

        console.log("newDocument", newDocument);

        console.log("create-new-document-submit-btn 22222");

        if (!confirm('Đăng tài liệu mới')) {
            return
        }
        createNewDocument(newDocument);
    })

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

        var formData = new FormData();
        var imageFile = document.getElementById('image-upload').files[0];
        imageFile.fieldname = 'image';
        formData.append('image', imageFile);

        if (imageFile && imageFile.type.startsWith('image/')) {
            try {
                await fileReaderPostImage(formData);
                photoValues1.push(postImageFileName);
                displayImage1(`/postImg/${postImageFileName}`, 'preview-images-post');
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else {
            showNotification('Vui lòng chọn một tệp ảnh hợp lệ.');
        }
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
                        <img src="/userImg/${user.profilePicture}" alt="User Avatar">
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

        var $data = $(this).siblings('div');
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
        // console.log("updatePost1", updatePost1);

        if (!confirm('Cập nhật bài đăng')) {
            return
        }
        updatePost(updatePost1);
    }); 

    $(document).on('click', '.Xbuttonimage', function(event1) {
        event1.stopPropagation();
        // console.log("Bấm vào nút X ở update");

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
        // showUser(user, users, posts, friendsArr);
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

        profilePicture2 = user.profilePicture;
        coverPicture2 = user.coverPicture;
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
            displayImage1(`/userImg/${user.profilePicture}`, 'preview_profile_picture');
            displayImage1(`/userImg/${user.coverPicture}`, 'preview_cover_picture');
        }
        $('.window').show();
    });

    $(document).on('click', '.update-info-button', async function(event) {
        event.stopPropagation();
        console.log('click .update-info-button')
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
            profilePicture1 = 'avatar.jpg';
        }

        if(coverPicture2){
            coverPicture1 = coverPicture2;
        } else {
            coverPicture1 = 'cover.jpg';
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

        if (!confirm('Cập nhật thông tin người dùng')) {
            return
        }
        updateInfo(updateInfo1);
    });
    
    $(document).on('change','#profile-image-upload', async function(event) {
        event.stopPropagation();
        var formData = new FormData();
        var imageFile = document.getElementById('profile-image-upload').files[0];
        imageFile.fieldname = 'image';
        formData.append('image', imageFile);

        if (imageFile && imageFile.type.startsWith('image/')) {
            try {
                await fileReaderUserImage(formData);
                profilePicture2 = userImageFileName;
                displayImage1(`/userImg/${profilePicture2}`, 'preview_profile_picture');
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else {
            showNotification('Vui lòng chọn một tệp ảnh hợp lệ.');
        }
    })

    $(document).on('change','#cover-image-upload', async function(event) {
        event.stopPropagation();
        var formData = new FormData();
        var imageFile = document.getElementById('cover-image-upload').files[0];
        imageFile.fieldname = 'image';
        formData.append('image', imageFile);

        if (imageFile && imageFile.type.startsWith('image/')) {
            try {
                await fileReaderUserImage(formData);
                coverPicture2 = userImageFileName;
                displayImage1(`/userImg/${coverPicture2}`, 'preview_cover_picture');
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

    $(document).on('click','.like-button',  async function(event) {
        event.stopPropagation();
        event.preventDefault();
        const postId = $(this).closest('.interaction-buttons').data('post-id');
        const likeArrClick = likesArr;
        const likesPost = likeArrClick.filter(item => item.likePostId == postId); 
        // var documentId = $(this).closest('.post-content-container1.document-post-content').data('document-id');
        // var documentId = $(this).closest('.post-content.document-post-content').data('document-id');
        // console.log("documentId",documentId)
        // Tìm phần tử cha gần nhất có class 'post-content document-post-content'
        var documentId = $(this).closest('.post-content-container1').data('document-id');
        
        let totalLikes = likesPost.length;
        $(this).toggleClass('liked');
        const likeCountElement = document.querySelector(`.interaction-buttons-${postId} .like-count span`);
        
        if ($(this).hasClass('liked')) {
            totalLikes++;
            console.log("totalLikes++",totalLikes)

            const createLike1 = {
                userId: user._id,
                likePostId: postId,
                documentId: documentId
            }
            createLike(createLike1);
        } else {
            totalLikes--;
            console.log("totalLikes--",totalLikes)

            const deleteLike1 = {
                userId: user._id,
                likePostId: postId,
                documentId: documentId
            }
            deleteLike(deleteLike1);
        }
        likeCountElement.textContent = totalLikes + ' likes';
    })

    $(document).on('mouseover','.like-count',  function(event) {
        event.stopPropagation();
        // console.log("mouseover");
        const postId = this.getAttribute('data-post-id');
        const tooltips = document.querySelectorAll(`.people-like-${postId}`);
        
        tooltips.forEach(tooltip => {
            tooltip.classList.add('active');
        });
        
    })

    $(document).on('mouseout','.like-count',  function(event) {
        event.stopPropagation();
        const tooltips = document.querySelectorAll('.people-like');

        tooltips.forEach(tooltip => {
            tooltip.classList.remove('active'); 
        });
    })

    $(document).on('click', '.send-comment-button', function(event) {
        event.stopPropagation();
        const postContainer = $(this).closest('.post-content-container1');
        const postId = postContainer.data('post-id');

        const commentInput = $(this).siblings('.comment-text');
        const commentText = commentInput.val().trim();
        const commentsContainer = $(`.comments-${ postId }`);
        // console.log("commentText",commentText);
        // console.log("userId",user._id);
        // console.log("postId",postId);
        var timeComment = formatTimeAgo(Date.now());


        if (commentText !== '') {
            // Tạo phần tử comment mới
            const newCommentHtml = $(`
            <div class="comment">
                <div class="comment-header">
                    <div class="comment-avatar">
                        <img src="/userImg/${user.profilePicture}" alt="Avatar">
                    </div>
                    <div class="comment-content">
                        <span class="comment-author">${user.fullname}</span>
                        <p>${commentText}</p>
                    </div>
                    <div class="comment-options">
                        <span class="options-icon">...</span>
                        <div class="options-menu">
                            <div class="option edit">Chỉnh sửa</div>
                            <div class="option delete">Xóa</div>
                        </div>
                    </div>
                </div>
                <div class="comment-meta">
                    <span class="comment-date">${timeComment}</span>
                    <button class="like-comment">Thích</button>
                    <button class="reply-comment">Phản hồi</button>
                </div>
            </div>

            `);
            commentsContainer.append(newCommentHtml);
            // Xóa nội dung của input
            commentInput.val('');

            var newComment = {
                commentText: commentText,
                userId: user._id,
                postId: postId,
            }
            createNewComment(newComment); 

        }else{
            showNotification("Bạn chưa điền comment!");
        }
    });

    $(document).on('keyup', '.comment-text', function(event) {
        if (event.key === 'Enter') {
            $(this).siblings('.send-comment-button').click();
        }
    });

    $(document).on('mouseover','.comment-date',  function(event) {
        event.stopPropagation();
        const commentId = $(this).closest('.comment-meta').attr('data-comment-id');
        console.log("commentId",commentId);

        const tooltips = document.querySelectorAll(`.comment-date-tooltip1-${commentId}`);
        
        tooltips.forEach(tooltip => {
            tooltip.classList.add('active');
        });
        
    });

    $(document).on('mouseout','.comment-date',  function(event) {
        event.stopPropagation();
        const commentId = $(this).closest('.comment-meta').attr('data-comment-id');
        const tooltips = document.querySelectorAll(`.comment-date-tooltip1-${commentId}`);

        tooltips.forEach(tooltip => {
            tooltip.classList.remove('active'); 
        });
    });

    //Khi nhấn nút để chỉnh sửa comment
    $(document).on('click', '.options-icon', function(event) {
        event.stopPropagation();
        console.log('click .options-icon')
        // console.log("user", user);
        
        const commentId = this.getAttribute('data-comment-id');
        const userId = this.getAttribute('data-comment-user'); //userId của ngưỜi comment

        var comments1 = findObjectById(commentsArr, commentId )
        var userComment = findObjectById(users, comments1.userId )
        
        if(userComment._id == user._id){
            const dropdownMenu = document.querySelector(`.options-menu-${commentId}`);
       
            if (dropdownMenu.classList.contains('active')) {
                dropdownMenu.classList.remove('active');
            } else {
                document.querySelectorAll('.options-menu').forEach(item => {
                    item.classList.remove('active');
                });
                dropdownMenu.classList.add('active');
            }
        } else {
            showNotification("Bạn không thể chỉnh sửa comment này!");
        }
    }); 

    $(document).on('click', function(event) {
        // Kiểm tra nếu click không phải vào .options-icon hoặc bên trong .options-menu
        if (!$(event.target).closest('.options-icon').length && !$(event.target).closest('.options-menu').length) {
            document.querySelectorAll('.options-menu').forEach(item => {
                item.classList.remove('active');
            });
        }
    });

    $(document).on('click', '.update-comment-btn', async function(event) {
        event.stopPropagation();
        console.log("update-comment-btn");
        var commentId = $(this).data('value');
        console.log("update-comment-btn commentId", commentId);

        var commentElement = $('.comment-' + commentId);
        var commentTextElement = commentElement.find('.comment-text1');
        var commentEditElement = commentElement.find('.comment-edit');
        var sendCommentEditButton = commentElement.find('.send-comment-edit');
        console.log("update-comment-btn commentElement", commentElement);

        // Hiển thị ô nhập và nút gửi, ẩn đoạn văn bản
        commentTextElement.hide();
        commentEditElement.show();
        sendCommentEditButton.show();

        // Đặt con trỏ vào ô nhập và chọn nội dung
        commentEditElement.focus().select();
    });

    $(document).on('click', function(event) {
        if (!$(event.target).closest('.comment-edit, .send-comment-edit').length) {
            // $('.reply-input-container').hide();
            $('.comment-edit').hide();
            $('.send-comment-edit').hide();
            $('.comment-text1').show();

        }
    });

    $(document).on('click', '.send-comment-edit', function(event) {
        const commentId = $(this).closest('.comment').attr('data-comment-id');
        var commentElement = $('.comment-' + commentId);
        var commentEditElement = commentElement.find('.comment-edit').val();
        var comment1 = findObjectById(commentsArr, commentId);
        if(commentEditElement) {
            var updateComment1 = {
                _id: comment1._id,
                commentText: commentEditElement,
                userId: comment1.userId,
                postId: comment1.postId,
                isEdited: true
            }
            saveComment(comment1._id);
            updateComment(updateComment1);
        } else {
            showNotification("Bạn chưa điền comment");
        }
        
    });

    $(document).on('click','.like-comment-button',  async function(event) {
        event.stopPropagation();
        event.preventDefault();
        const commentId = $(this).closest('.comment-meta').data('comment-id');
        const likeCommentArrClick = likesArr;
        const likesComment = likeCommentArrClick.filter(item => item.likeCommentId == commentId);

        let totalLikes = likesComment.length;
        $(this).toggleClass('liked-comment');
        const likeCountElement = document.querySelector(`.like-comment-count-${commentId} span`);
        
        if ($(this).hasClass('liked-comment')) {
            totalLikes++;
            console.log("totalLikes++",totalLikes)

            const createLike1 = {
                userId: user._id,
                likeCommentId: commentId,
            }
            createLike(createLike1);
        } else {
            totalLikes--;
            console.log("totalLikes--",totalLikes)

            const deleteLike1 = {
                userId: user._id,
                likeCommentId: commentId,
            }
            deleteLike(deleteLike1);
        }
        likeCountElement.textContent = totalLikes + ' likes';
    })

    $(document).on('click', '.reply-comment', function(event) {
        event.stopPropagation();
        console.log("reply-comment");
        var commentId = $(this).closest('.comment-meta').data('comment-id');
        console.log("commentId",commentId);

        var replyInputContainer = $(`.reply-input-container-${commentId}`);
        replyInputContainer.toggle();

        
    });

    $(document).on('click', function(event) {
        // Check if the click was outside the reply input container
        if (!$(event.target).closest('.reply-input-container, .reply-comment').length) {
            $('.reply-input-container').hide();
        }
    });

    $(document).on('click', '.send-reply-button', function(event) {
        event.stopPropagation();
        
        const commentId = $(this).closest('.comment').attr('data-comment-id');
        const postId = $(this).closest('.comment').attr('data-post-id');
        var timeReplyComment = formatTimeAgo(Date.now());
        var replyCommentInput = $('.reply-input-container-' + commentId + ' .reply-input');
        var replyCommentText = replyCommentInput.val().trim();

        if (replyCommentText !== '') {
            // Tạo phần tử comment mới
            var replyHtml = `
            <div class="reply">
                <div class="reply-header">
                    <div class="reply-avatar reply-comment-avatar">
                        <img src="/userImg/${user.profilePicture}" alt="Avatar">
                    </div>
                    <div class="reply-content">
                        <span class="reply-author">${user.fullname}</span>
                        <p>${replyCommentText}</p>
                    </div>
                    <div class="reply-options">
                        <span class="options-icon">...</span>
                        <div class="options-menu">
                            <div class="option edit">Chỉnh sửa</div>
                            <div class="option delete">Xóa</div>
                        </div>
                    </div>
                </div>
                <div class="reply-meta">
                    <span class="reply-date">${timeReplyComment}</span>
                    <button class="like-reply-button">Thích</button>
                    <div class="like-comment-count like-comment-count-${commentId}" data-comment-id="${commentId}">
                        <i class="fa-solid fa-thumbs-up"></i> 
                        <span> 0 likes </span>
                        <div class="people-like-comment people-like-comment-${ commentId }"></div>
                    </div>
                </div>
            </div>
            `;
            $('.replies-container-' + commentId).append(replyHtml);
            replyCommentInput.val('');
            $('.reply-input-container-' + commentId).hide();

            var newComment = {
                commentText: replyCommentText,
                userId: user._id,
                postId: postId,
                repCommentId: commentId,
            }
            createNewComment(newComment); 

        }else{
            showNotification("Bạn chưa điền comment!");
        }
    });

    $(document).on('click', '.update-reply-comment-btn', async function(event) {
        event.stopPropagation();
        console.log("update-reply-comment-btn");
        var replyCommentId = $(this).data('value');
        console.log("update-comment-btn replyCommentId", replyCommentId);

        var commentElement = $('.reply-' + replyCommentId);
        var commentTextElement = commentElement.find('.comment-text2');
        var commentEditElement = commentElement.find('.reply-comment-edit');
        var sendCommentEditButton = commentElement.find('.send-reply-comment-edit');
        // console.log("update-comment-btn commentElement", commentElement);

        // Hiển thị ô nhập và nút gửi, ẩn đoạn văn bản
        commentTextElement.hide();
        commentEditElement.show();
        sendCommentEditButton.show();

        // Đặt con trỏ vào ô nhập và chọn nội dung
        commentEditElement.focus().select();
    });

    $(document).on('click', function(event) {
        if (!$(event.target).closest('.reply-comment-edit, .send-reply-comment-edit').length) {
            // $('.reply-input-container').hide();
            $('.reply-comment-edit').hide();
            $('.send-reply-comment-edit').hide();
            $('.comment-text2').show();
        }
    });

    $(document).on('click', '.send-reply-comment-edit', function(event) {
        const replyCommentId = $(this).closest('.reply').attr('data-reply-comment-id');
        var commentElement = $('.reply-' + replyCommentId);
        var commentEditElement = commentElement.find('.reply-comment-edit').val();
        var comment1 = findObjectById(commentsArr, replyCommentId);
        
        if(commentEditElement) {
            var updateComment1 = {
                _id: comment1._id,
                commentText: commentEditElement,
                userId: comment1.userId,
                postId: comment1.postId,
                repCommentId: comment1.repCommentId,
                isEdited: true
            }
            console.log("send-reply-comment-edit updateComment1",updateComment1);

            saveReplyComment(comment1._id);
            updateComment(updateComment1);
        } else {
            showNotification("Bạn chưa điền comment");
        }
        
    });

    $(document).on('click','.like-reply-comment-button',  async function(event) {
        event.stopPropagation();
        event.preventDefault();
        const replyCommentId = $(this).closest('.reply-meta').data('reply-comment-id');
        const likeCommentArrClick = likesArr;
        const likesComment = likeCommentArrClick.filter(item => item.likeCommentId == replyCommentId);
        console.log("replyCommentId",replyCommentId)
        let totalLikes = likesComment.length;
        $(this).toggleClass('liked-comment');
        const likeCountElement = document.querySelector(`.like-reply-comment-count-${replyCommentId} span`);
        
        if ($(this).hasClass('liked-comment')) {
            totalLikes++;
            // console.log("totalLikes++",totalLikes)

            const createLike1 = {
                userId: user._id,
                likeCommentId: replyCommentId,
            }
            createLike(createLike1);
        } else {
            totalLikes--;
            // console.log("totalLikes--",totalLikes)

            const deleteLike1 = {
                userId: user._id,
                likeCommentId: replyCommentId,
            }
            deleteLike(deleteLike1);
        }
        likeCountElement.textContent = totalLikes + ' likes';
    })

    $(document).on('mouseover','.like-comment-count',  function(event) {
        event.stopPropagation();
        // console.log("mouseover");
        const commentId = this.getAttribute('data-comment-id');
        const tooltips = document.querySelectorAll(`.people-like-comment-${commentId}`);
        
        tooltips.forEach(tooltip => {
            tooltip.classList.add('active');
        });
        
    })

    $(document).on('mouseout','.like-comment-count',  function(event) {
        event.stopPropagation();
        const tooltips = document.querySelectorAll('.people-like-comment');

        tooltips.forEach(tooltip => {
            tooltip.classList.remove('active'); 
        });
    })

    $(document).on('mouseover','.like-reply-comment-count',  function(event) {
        event.stopPropagation();
        // console.log("mouseover");
        const replyCommentId = this.getAttribute('data-reply-comment-id');
        const tooltips = document.querySelectorAll(`.people-like-reply-comment-${replyCommentId}`);
        
        tooltips.forEach(tooltip => {
            tooltip.classList.add('active');
        });
        
    })

    $(document).on('mouseout','.like-reply-comment-count',  function(event) {
        event.stopPropagation();
        const tooltips = document.querySelectorAll('.people-like-reply-comment');

        tooltips.forEach(tooltip => {
            tooltip.classList.remove('active'); 
        });
    })

    $(document).on('click','.document-post-content', async function(event) {
        event.stopPropagation();
        var documentId = $(this).closest('.document-post-content').data('document-id');
        updateDocument(documentId);
        if(documentId){
            window.location.href = `http://localhost:3000/document/${documentId}`;
        }
    })

    

});

function createNewDocument(newDocument){
    console.log("createNewDocument",newDocument);
    fetch('http://localhost:3000/api/document', {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body: JSON.stringify({newDocument:newDocument})
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
        console.log("createNewDocument",result);
        // $('#document_display').html(`<h2>Uploaded Document</h2><p>Title: ${result.title}</p><p>Description: ${result.description}</p><p>Field of Study: ${result.field}</p>`);

        setTimeout(function() {
            window.location.href = 'http://localhost:3000/document';
        }, 500);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function updateDocument(documentId) {
    console.log("UPDATE");

    fetch('http://localhost:3000/api/document', {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body:JSON.stringify({documentId:documentId})
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
        console.log("result",result)
        // setTimeout(function() {
        //     window.location.href = 'http://localhost:3000/';
        // }, 500);
    
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function createReplyCommentsHTML(replyComments, users, likesArr, currUser, postId) {
    return replyComments.map(replyComment => {
        var replyCurrCommentId = replyComment._id;
        // console.log("replyCurrCommentId", replyCurrCommentId)
        // Hiển thị những người like
        var likesComment = likesArr.filter(item => item.likeCommentId == replyCurrCommentId); //Lấy mảng từ likesArr có likeCommentId giống currCommentId
        var peoplelikesPost = likesComment.map(likeComment => likeComment.userId);
        var fullnamePeopleLike = getFullnameFromUserId(peoplelikesPost, users);
        var peoplelikesCommentList = createPeopleLikeList(fullnamePeopleLike);

        //Hiển thị biểu tượng like
        var likedClass = '';
        var isExist = likesComment.some(item => item.userId == currUser._id);
        if (isExist) {
            likedClass = 'liked-comment';
        }

        // Tìm user tương ứng với userId trong bình luận
        const user = users.find(user => user._id == replyComment.userId);
        var replyCommentCreatedAt = replyComment.createdAt;
        var likeReplyCommentVal = likesArr.filter(likeArr => likeArr.likeCommentId == replyCurrCommentId);
        var likeReplyCommentValLength = likeReplyCommentVal.length;

        var timeReplyComment = formatTimeAgo(replyCommentCreatedAt);
        var timeReplyCommentTooltip = formatDateAndTooltip2(replyCommentCreatedAt);


        if (!user) return '';
        // Tạo HTML cho bình luận
        return `
        <div class="reply reply-${replyCurrCommentId}" data-reply-comment-id="${replyCurrCommentId}">
            <div class="reply-header">
                <div class="reply-avatar reply-comment-avatar user-page" data-value="${user._id} ">
                    <img src="/userImg/${user.profilePicture}" alt="Avatar">
                </div>
                <div class="reply-content">
                    <span class="reply-author user-page" data-value="${user._id} ">${user.fullname}</span>
                    <p class="comment-text2">${replyComment.commentText}</p>
                    <textarea class="reply-comment-edit" style="display:none;">${replyComment.commentText}</textarea>
                    <button class="send-reply-comment-edit" style="display:none;"><i class="fa-solid fa-paper-plane"></i></button>

                </div>
                <div class="reply-options">
                    <span class="options-icon" data-comment-id="${replyCurrCommentId}" data-comment-user="${user._id}">...</span>
                    <div class="options-menu options-menu-${replyCurrCommentId}"">
                        <button id="update-reply-comment" data-value="${replyCurrCommentId}" title="Cập nhật Comment" class="btn update-reply-comment-btn btn-link">Chỉnh sửa</button>
                        <button onclick="deleteComment('${replyCurrCommentId}');" title="Xoá" class="btn delete-btn btn-link">Xoá</button>
                    </div>
                </div>
            </div>
            <div class="reply-meta" data-reply-comment-id = "${replyCurrCommentId}">
                <div>
                    <span class="reply-date">${timeReplyComment}</span>
                    <div class="comment-date-tooltip1 comment-date-tooltip1-${ replyCurrCommentId }"> <span>${timeReplyCommentTooltip}</span></div>
                </div>

                <button class="like-reply-comment-button ${likedClass}">Thích</button>
                <span class = "isEdited-${replyComment.isEdited}"> Đã chỉnh sửa </span>
                    
                <div class="like-reply-comment-count like-reply-comment-count-${replyCurrCommentId}" data-reply-comment-id="${replyCurrCommentId}">
                    <i class="fa-solid fa-thumbs-up"></i> 
                    <span> ${likeReplyCommentValLength} likes </span>
                    <div class="people-like-reply-comment people-like-reply-comment-${ replyCurrCommentId }">${ peoplelikesCommentList }</div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function createCommentsHTML(comments, users, likesArr, currUser) {
    // console.log("comments 123",comments)
    const commentsWithoutReplies = comments.filter(comment => !comment.hasOwnProperty('repCommentId'));
    const commentsWithReplies = comments.filter(comment => comment.hasOwnProperty('repCommentId'));
    return commentsWithoutReplies.map(comment => {
        var currCommentId = comment._id;

        //Hiển thị những người like
        var likesComment = likesArr.filter(item => item.likeCommentId == currCommentId); //Lấy mảng từ likesArr có likeCommentId giống currCommentId
        var peoplelikesPost = likesComment.map(likeComment => likeComment.userId);
        var fullnamePeopleLike = getFullnameFromUserId(peoplelikesPost, users);
        var peoplelikesCommentList = createPeopleLikeList(fullnamePeopleLike);

        //Hiển thị biểu tượng like
        var likedClass = '';
        var isExist = likesComment.some(item => item.userId == currUser._id);
        if (isExist) {
            likedClass = 'liked-comment';
        }

        // Tìm user tương ứng với userId trong bình luận
        const user = users.find(user => user._id == comment.userId);
        var commentCreatedAt = comment.createdAt;
        var likeCommentVal = likesArr.filter(likeArr => likeArr.likeCommentId == currCommentId);
        var likeCommentValLength = likeCommentVal.length;

        var timeComment = formatTimeAgo(commentCreatedAt);
        var timeCommentTooltip = formatDateAndTooltip2(commentCreatedAt);

        //Lấy các giá trị reply-comment
        var replyCommentsPost = commentsWithReplies.filter(item => item.repCommentId == currCommentId);
        // console.log("createCommentsHTML currCommentId",currCommentId)
        // console.log("comments",comments);
        const postId = comments[0].postId;
        // console.log("postId",postId);
        // console.log("replyCommentsPost",replyCommentsPost)
        var replyCommentHtml = createReplyCommentsHTML(replyCommentsPost, users, likesArr, user, postId);
        
        //Lấy giá trị postId post-content-container1
        // var postContentContainer = document.querySelector('.post-content-container1');
        // // var postContentContainer1 = document.querySelector('.post-content-container1').data('post-id');
        // console.log("postContentContainer",postContentContainer); 
        // // console.log("postContentContainer1",postContentContainer1); 

        if (!user) return '';
        // Tạo HTML cho bình luận
        return `
            <div class="comment comment-${currCommentId}" data-comment-id="${currCommentId}" data-post-id="${postId}">
                <div class="comment-header">
                    <div class="comment-avatar user-page" data-value="${user._id} ">
                        <img src="/userImg/${user.profilePicture}" alt="Avatar">
                    </div>
                    <div class="comment-content">
                        <span class="comment-author user-page" data-value="${user._id} ">${user.fullname}</span>
                        <p class="comment-text1">${comment.commentText}</p>
                        <textarea class="comment-edit" style="display:none;">${comment.commentText}</textarea>
                        <button class="send-comment-edit" style="display:none;"><i class="fa-solid fa-paper-plane"></i></button>

                    </div>
                    <div class="comment-options">
                        <span class="options-icon" data-comment-id="${currCommentId}" data-comment-user="${user._id}">...</span>
                        <div class="options-menu options-menu-${currCommentId}">
                            <button id="update-comment" data-value="${currCommentId}" title="Cập nhật Comment" class="btn update-comment-btn btn-link">Chỉnh sửa</button>
                            <button onclick="deleteComment('${currCommentId}');" title="Xoá" class="btn delete-btn btn-link">Xoá</button>
                        </div>
                    </div>
                </div>
                <div class="comment-meta" data-comment-id = "${currCommentId}">
                    <div>
                        <span class="comment-date" data-timestamp="${comment.timestamp}">${timeComment}</span>
                        <div class="comment-date-tooltip1 comment-date-tooltip1-${ currCommentId }"> <span>${timeCommentTooltip}</span></div>
                    </div>
                    <button class="like-comment-button ${likedClass}">Thích</button>
                    <button class="reply-comment">Phản hồi</button>
                    <span class = "isEdited-${comment.isEdited}"> Đã chỉnh sửa </span>
                    <div class="like-comment-count like-comment-count-${currCommentId}" data-comment-id="${currCommentId}">
                        <i class="fa-solid fa-thumbs-up"></i> 
                        <span> ${likeCommentValLength} likes </span>
                        <div class="people-like-comment people-like-comment-${ currCommentId }">${ peoplelikesCommentList }</div>
                    </div>
                </div> 
                <div class="replies-container replies-container-${currCommentId}">
                    <!-- Replies will be appended here -->
                    ${replyCommentHtml}
                </div>
                <div class="reply-input-container reply-input-container-${currCommentId}" style="display:none;">
                    <div class="reply-comment-avatar">
                        <img src="/userImg/${currUser.profilePicture}" alt="Avatar">
                    </div>
                    <div class="reply-input-wrapper">
                        <textarea class="reply-input reply-input-text" placeholder="Nhập phản hồi..."></textarea>
                        <button class="send-reply-button"><i class="fa-solid fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

//Hàm lưu ảnh  chưa dùng tới
async function fileReaderImage(file) {
    console.log("fileReaderImage");
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        console.log("reader",reader);

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

//Lưu ảnh avatar và cover
async function fileReaderUserImage(formData) {
    console.log("fileReaderUserImage");
    try {
        const response = await fetch('http://localhost:3000/api/uploadUserImg', {
            method: "POST",
            body: formData
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
            // showNotification(result.message);
            console.log("fileReaderImage",result.filename);
            userImageFileName = result.filename;

        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });

                
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
    }       
}

//Lưu ảnh bài đăng
async function fileReaderPostImage(formData) {
    console.log("fileReaderUserImage");
    try {
        const response = await fetch('http://localhost:3000/api/uploadPostImg', {
            method: "POST",
            body: formData
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
            // showNotification(result.message);
            console.log("fileReaderImage",result.filename);
            postImageFileName = result.filename;

        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });

                
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
    }       
}

//Chưa dùng
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

async function showPost(postsArr, className) {
    // console.log(" showPost likesArr");
    console.log(" showPost postsArr",postsArr);
    
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
        // console.log("likesPost",likesPost)
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
    const imageHTML = `
    <div class="image-container">
        <img src="${imageUrl}" style="max-width: 200px; max-height: 200px;">
        <button class="Xbuttonimage">X</button>
    </div>
    `;
    const previewContainer = document.querySelector(`.${className}`); // Thay '.preview-container' bằng lớp CSS hoặc id của vị trí bạn muốn hiển thị
    previewContainer.innerHTML += imageHTML;
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

function formatTimeAgo(createdAt) {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const timeDiff = now - createdDate;
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return `${years} năm trước`;
    } else if (months > 0) {
        return `${months} tháng trước`;
    } else if (weeks > 0) {
        return `${weeks} tuần trước`;
    } else if (days > 0) {
        return `${days} ngày trước`;
    } else if (hours > 0) {
        return `${hours} giờ trước`;
    } else if (minutes > 0) {
        return `${minutes} phút trước`;
    } else {
        return `Vừa xong`;
    }
}

async function createLike (createLike) {
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
        // console.log("likeArr createLike result",result);
        likesArr = result.likeArr1;
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

}

async function deleteLike(deleteLike) {
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
            // console.log("likeArr createLike result",result.likeArr1);
            likesArr = result.likeArr1;
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

function createPeopleLikeList(strings) {
    // Kiểm tra nếu đầu vào không phải là một mảng hoặc mảng trống
    if (!Array.isArray(strings) || strings.length === 0) {
      return '';
    }
  
    const htmlItems = strings.map(str => `<span>${str}</span><br>`);
    const htmlString = htmlItems.join('');
  
    return `${htmlString}`;
  }

  function getFullnameFromUserId(userIds, usersArray) {
    return userIds.map(userId => {
      const user = usersArray.find(user => user._id === userId);
      return user ? user.fullname : `User with ID ${userId} not found`;
    });
  }

  function createNewComment (newComment) {
    console.log("createNewComment",newComment);
    fetch('http://localhost:3000/api/comment', {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body:JSON.stringify(newComment)
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

    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

}

async function deleteComment(idComment) {
    // if(confirm("confirm delete")){
        fetch(`http://localhost:3000/api/comment`, {
            method: 'DELETE',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({ idComment: idComment })
        })
        .then(response => {
            if(!response.ok){
                throw new Error("Network response not ok!");
            }
            return response.json();
        })
        .then(result =>{
            console.log(result);
            commentsArr = result.commentArr1;
            console.log("commentsArr",commentsArr);
            $(`.comment-${idComment}`).remove();
        })
    // }
}

function updateComment (updateComment) {
    console.log("UPDATE");

    fetch('http://localhost:3000/api/comment', {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body:JSON.stringify(updateComment)
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

        commentsArr = result.commentArr1;
        console.log("commentsArr",commentsArr);
    
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function saveComment(commentId) {
    console.log("saveComment");

    var commentElement = $('.comment-' + commentId);
    var commentEditElement = commentElement.find('.comment-edit');
    var commentTextElement = commentElement.find('.comment-text1');
    var sendCommentEditButton = commentElement.find('.send-comment-edit');
    var updatedComment = commentEditElement.val();
    console.log("updatedComment",updatedComment);

    // Thay đổi nội dung comment gốc
    commentTextElement.text(updatedComment);

    // Ẩn ô nhập và nút gửi, hiển thị lại đoạn văn bản
    commentEditElement.hide();
    sendCommentEditButton.hide();
    commentTextElement.show();

}

function saveReplyComment(replyCommentId) {
    console.log("saveReplyComment");

    var commentElement = $('.reply-' + replyCommentId);
    var commentTextElement = commentElement.find('.comment-text2');
    var commentEditElement = commentElement.find('.reply-comment-edit');
    var sendCommentEditButton = commentElement.find('.send-reply-comment-edit');
    var updatedComment = commentEditElement.val();
    // console.log("updatedComment",updatedComment);

    // Thay đổi nội dung comment gốc
    commentTextElement.text(updatedComment);

    // Ẩn ô nhập và nút gửi, hiển thị lại đoạn văn bản
    commentEditElement.hide();
    sendCommentEditButton.hide();
    commentTextElement.show();

}



// module.exports = { displayFriendsList,
//     createReplyCommentsHTML, createCommentsHTML, 
//     fileReaderUserImage, fileReaderPostImage,
//     search, showNotification, getQueryParam, findObjectById,
//     showPost, creatNewPost, deletePost, updatePost,
//     updateInfo, displayImage, displayImage1,
//     formatDate, formatDate2, formatDateAndTooltip1, formatDateAndTooltip2, formatTimeAgo,
//     createLike, deleteLike, createPeopleLikeList, getFullnameFromUserId,
//     createNewComment, deleteComment, updateComment, saveComment, saveReplyComment
//  };