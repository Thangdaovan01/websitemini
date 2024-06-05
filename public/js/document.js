var documentsArr = [];
var usersArr = [];
var likesArr = [];
var postsArr = [];
var currUser = {};
var documentFileName = '';
var imageFileName = '';
const token = localStorage.getItem('jwtToken');
 
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
        // console.log("USER",result);
        // showUsers(usersArr);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });


    //Lấy giá trị like
    fetch('http://localhost:3000/api/likes', {
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
        likesArr = result.likes;
        // console.log("LIKE",likesArr);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

    //Lấy giá trị posts
    fetch('http://localhost:3000/api/posts', {
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
        const postsArr1 = result.posts;
        postsArr = postsArr1.filter(post => post.documentId && post.documentId.trim() !== '');
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

    //Lấy giá trị document
    fetch('http://localhost:3000/api/documents', {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
        }
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                // showNotification(data.message);
                throw new Error('Network response was not ok');
            }
            return data;
        });
    })
    .then(result => {
        documentsArr = result.documents;
        console.log("documentsArr",documentsArr);
        showSidebar(currUser);

        // var recentlyPostArr = documentsArr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
        var recentlyPostArr = documentsArr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        showDocumentSection(recentlyPostArr, 'recently-document-section')
        // showDocuments(documentsArr); recently-view-section
        // showMaybeInterestedSection(postsArr,likesArr, documentsArr);
        // showRecentlyViewSection(currUser, documentsArr);
        var recentlyViewArr = getRecentlyViewSection(currUser, documentsArr);
        showDocumentSection(recentlyViewArr, 'recently-view-section')
        
        var maybeInterestedArr = getMaybeInterestedSection(postsArr,likesArr, documentsArr);
        showDocumentSection(maybeInterestedArr, 'maybe-interested-section')
        
        
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
})

$(document).ready(function() {
    $(document).on('click', '.create-new-document-btn', function(event) {
        event.stopPropagation();
        console.log("create-new-document-btn");
        
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

    $(document).on('click', function(event) {
        // Kiểm tra nếu click vào phần tử không phải là .create-row-container hoặc các phần tử con của nó
        if (!$(event.target).closest('.window').length && !$(event.target).is('.Xbuttonimage')) {
            // Ẩn đi phần tử .window
            $('.window').hide();
            $("body").children().removeClass("blur");
        }
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

    $(document).on('change','#document', async function(event) {
        event.stopPropagation();

        var formData = new FormData();
        var documentFile = document.getElementById('document').files[0];
        documentFile.fieldname = 'document';
        formData.append('document', documentFile);

        if (documentFile) {
            try {
                const documentName = await fileReaderDocument(formData);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else {
            showNotification('Vui lòng chọn một tệp ảnh hợp lệ.');
        }
    })

    $(document).on('change','#document-image', async function(event) {
        event.stopPropagation();

        var formData = new FormData();
        var imageFile = document.getElementById('document-image').files[0];
        imageFile.fieldname = 'documentImage';
        formData.append('documentImage', imageFile);

        if (imageFile) {
            try {
                const documentName = await fileReaderImage(formData);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else {
            showNotification('Vui lòng chọn một tệp ảnh hợp lệ.');
        }
    })

    $(document).on('click','.recently-document-item img, .recently-document-item .title', async function(event) {
        event.stopPropagation();
        var documentId = $(this).closest('.recently-document-item').data('document-id');
        updateDocument(documentId);

        if(documentId){
            window.location.href = `http://localhost:3000/document/${documentId}`;
        }
    })

    // $(document).on('click','.recently-document-item img, .recently-document-item .title', async function(event) {
    $('#search_document_form').submit(function(event){
        event.preventDefault();
        const searchText = $('.searchText').val();
        // console.log("searchText",searchText);
        searchDocument(searchText);
        $('#search-document-form input[type="text"]').val('');

    });
    
    $(document).on('click', '.maybe-interested-view-all', function(event) {
        event.stopPropagation();

        var maybeInterestedArr = getMaybeInterestedSection(postsArr,likesArr, documentsArr);
        // console.log("maybeInterestedArr",maybeInterestedArr);
        showDocuments(maybeInterestedArr,'Có thể bạn quan tâm');
    })

    $(document).on('click', '.recently-view-view-all', function(event) {
        event.stopPropagation();

        var recentlyViewArr = getRecentlyViewSection(currUser, documentsArr);
        showDocuments(recentlyViewArr,'Đã xem gần đây');
    })

    $(document).on('click', '.recently-document-view-all', function(event) {
        event.stopPropagation();

        var recentlyPostArr = documentsArr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        showDocuments(recentlyPostArr,'Đã đăng gần đây');
    })
    // my-document-upload
    $(document).on('click', '.my-document-upload', function(event) {
        event.stopPropagation();

        var userId = $(this).closest('.sidebar').data('user-id');
        console.log("userId",userId);
        const myDocumentArr = documentsArr.filter(object => object.createdBy == userId);

        const user = usersArr.find(user => user._id === userId);
        const fullname = user ? user.fullname : null;

        showDocuments(myDocumentArr,`Tài liệu được đăng bởi ${fullname}`);
    })

    $(document).on('click', '.user-page', function(event) {
        event.stopPropagation();

        var userId = $(this).closest('.sidebar').data('user-id');
        console.log("userId",userId);
        window.location.href = 'http://localhost:3000/user?id='+userId;
    })

})

function getRecentlyViewSection(currUser, documentsArr) {
    var currUserId = currUser._id;
    // Lọc và sắp xếp mảng documentsArr
    const filteredAndSortedDocuments = documentsArr.filter(document => {
        // Lọc ra các view có viewBy là currUser._id

        var usersViewValue = document.viewValue;
        if(!usersViewValue){
            return;
        } 
        const userViews = usersViewValue.filter(view => view.viewBy === currUserId);
        // Sắp xếp userViews theo thời gian viewAt giảm dần
        userViews.sort((a, b) => new Date(b.viewAt) - new Date(a.viewAt));
        if (userViews.length == 0) {
            return;
          }
        // Gán thời gian view gần nhất vào document
        document.latestViewAt = userViews[0].viewAt;
        
        return true;
    }).sort((a, b) => new Date(b.latestViewAt) - new Date(a.latestViewAt));
    // console.log("filteredAndSortedDocuments", filteredAndSortedDocuments)
    return filteredAndSortedDocuments;
}

function getMaybeInterestedSection(postsArr,likesArr, documentsArr) {
    //Lấy ra các postId và lượt like của các post chứa documentId
    const resultArr = postsArr.map(post => {
        const likeCount = likesArr.filter(like => like.likePostId == post._id).length;
        return { id: post.documentId, likeCount };
      });
    
    // Tạo mảng mới từ documentsArr với id và likeCount
    const documentLikeCounts = documentsArr.map(document => {
        const likeCount = resultArr.find(post => post.id == document._id)?.likeCount || 0;
        return { id: document._id, likeCount };
    });
    
    // Sắp xếp mảng mới theo likeCount giảm dần
    const sortedDocuments = documentLikeCounts.slice().sort((a, b) => b.likeCount - a.likeCount);
    
    // Bảo toàn các giá trị cũ của documentsArr trong mảng kết quả sortedDocuments
    const finalSortedDocuments = sortedDocuments.map(sortedDocument => {
        const originalDocument = documentsArr.find(document => document._id == sortedDocument.id);
        return { ...originalDocument, likeCount: sortedDocument.likeCount };
    });
    // showDocumentSection(finalSortedDocuments, 'maybe-interested-section')
    return finalSortedDocuments
    
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

function showSidebar(user) {
    const userId = user._id;
    const count = documentsArr.filter(doc => doc.createdBy === userId).length;
    document.querySelector('.profile .username').textContent = user.fullname;
    document.querySelector('.profile .uploadCount').textContent = `${count} Tải lên`;
    const sidebar = document.querySelector('.sidebar');
    sidebar.setAttribute('data-user-id', userId);
}

function searchDocument(searchText){
    console.log("searchDocument",searchText);

    fetch(`http://localhost:3000/api/searchDocument?query=${encodeURIComponent(searchText)}`, {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
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
        var searchResult = result.data;
        var searchLength = result.searchLength;
        console.log("searchResult", searchResult)
        $('.main-content').empty();
        showDocumentsSearch(searchResult);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
    
}

function showDocumentSection(DocumentArr, className) {
    const documentItemsContainer = document.querySelector(`.${className} .items`);
    var documentHTML = ``;
    for( let i = 0; i < 4; i++){
        const documentId = DocumentArr[i]._id;

        var timeCreatedAgo = timeAgo(DocumentArr[i].createdAt);
        const postDocument = postsArr.find(post => post.documentId === documentId);
        // console.log("postDocument",postDocument);
        const likeDocument = likesArr.filter(like => like.likePostId === postDocument._id).length;
        // console.log("likeDocument",likeDocument);

        documentHTML += `
        <div class="item recently-document-item recently-document-item-${documentId}" data-document-id="${documentId}">
            <img src="/documentsImg/${DocumentArr[i].documentImage}" >
            <div class="title">${DocumentArr[i].title}</div>
            <div class="description"> ${DocumentArr[i].description} </div>
            <div class="meta">
                <span class="likes">${likeDocument} Likes</span>
                <span class="date">${timeCreatedAgo}</span>
            </div>
        </div>   
        `
        documentItemsContainer.innerHTML = documentHTML;

    }
}

//chưa dùng
function showRecentlyPost(recentlyPostArr) {
    const recentlyPostItemsContainer = document.querySelector('.recently-document-section .items');
    var recentlyPostHTML = ``;
    for( let i = 0; i < recentlyPostArr.length; i++){
        var timeCreatedAgo = timeAgo(recentlyPostArr[i].createdAt);

        recentlyPostHTML += `
        <div class="item recently-document-item recently-document-item-${recentlyPostArr[i]._id}" data-document-id="${recentlyPostArr[i]._id}">
            <img src="/documentsImg/${recentlyPostArr[i].documentImage}" >
            <div class="title">${recentlyPostArr[i].title}</div>
            <div class="description"> ${recentlyPostArr[i].description} </div>
            <div class="meta">
                <span class="likes">234 Likes</span>
                <span class="date">${timeCreatedAgo}</span>
            </div>
        </div>   
        `
        recentlyPostItemsContainer.innerHTML = recentlyPostHTML;

    }
}
 
async function fileReaderDocument(formData) {
    console.log("fileReaderDocument");
    try {
        const response = await fetch('http://localhost:3000/api/uploadDocument', {
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
            console.log("fileReaderDocument",result);
            documentFileName = result.filename;
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });

                
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
    }       
}

async function fileReaderImage(formData) {
    console.log("fileReaderImage");
    try {
        const response = await fetch('http://localhost:3000/api/uploadDocumentImage', {
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
            console.log("fileReaderImage",result);
            imageFileName = result.filename;

        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });

                
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
    }       
}

function showDocuments(documentsArr, textContent) {
    console.log("documentsArr", documentsArr);
    var documentsLength = documentsArr.length
    const mainContent = document.querySelector('.main-content');
    // Làm trống nội dung bên trong main-content
    mainContent.innerHTML = '';
    // Tạo khối div mới với class section và documents-section
    const sectionDiv = document.createElement('div');
    sectionDiv.classList.add('section', 'documents-section');
    // Tạo thẻ h3 với nội dung
    const h3 = document.createElement('h3');
    h3.textContent = `${textContent}`;
    // Tạo khối div mới với class items và document-items
    const itemsDiv = document.createElement('div');
    itemsDiv.classList.add('items', 'document-items');
    // Thêm thẻ h3 và khối itemsDiv vào sectionDiv
    sectionDiv.appendChild(h3);
    sectionDiv.appendChild(itemsDiv);
    mainContent.appendChild(sectionDiv);

    const documentContainer = document.querySelector('.documents-section .items');
    var documentHTML = ``;
    for(let i = 0; i < documentsLength; i++) {
        var timeCreatedAgo = timeAgo(documentsArr[i].createdAt);

        const postDocument = postsArr.find(post => post.documentId === documentsArr[i]._id);
        // console.log("postDocument",postDocument);
        const likeDocument = likesArr.filter(like => like.likePostId === postDocument._id).length;

        documentHTML += `
        <div class="item recently-document-item recently-document-item-${documentsArr[i]._id}" data-document-id="${documentsArr[i]._id}">
            <img src="/documentsImg/${documentsArr[i].documentImage}" >
            <div class="title">${documentsArr[i].title}</div>
            <div class="description"> ${documentsArr[i].description} </div>
            <div class="meta">
                <span class="likes">${likeDocument} Likes</span>
                <span class="date">${timeCreatedAgo}</span>
            </div>
        </div>   
        `
        documentContainer.innerHTML = documentHTML;
    }
}

function showDocumentsSearch(documentsArr) {
    console.log("documentsArr", documentsArr);
    var documentsLength = documentsArr.length
    const mainContent = document.querySelector('.main-content');
    // Làm trống nội dung bên trong main-content
    mainContent.innerHTML = '';
    // Tạo khối div mới với class section và documents-section
    const sectionDiv = document.createElement('div');
    sectionDiv.classList.add('section', 'documents-section');
    // Tạo thẻ h3 với nội dung
    const h3 = document.createElement('h3');
    h3.textContent = `Có ${documentsLength} giá trị tìm kiếm`;
    // Tạo khối div mới với class items và document-items
    const itemsDiv = document.createElement('div');
    itemsDiv.classList.add('items', 'document-items');
    // Thêm thẻ h3 và khối itemsDiv vào sectionDiv
    sectionDiv.appendChild(h3);
    sectionDiv.appendChild(itemsDiv);
    mainContent.appendChild(sectionDiv);

    const documentContainer = document.querySelector('.documents-section .items');
    var documentHTML = ``;
    for(let i = 0; i < documentsLength; i++) {
        var timeCreatedAgo = timeAgo(documentsArr[i].createdAt);
        const postDocument = postsArr.find(post => post.documentId === documentsArr[i]._id);
        // console.log("postDocument",postDocument);
        const likeDocument = likesArr.filter(like => like.likePostId === postDocument._id).length;

        documentHTML += `
        <div class="item recently-document-item recently-document-item-${documentsArr[i]._id}" data-document-id="${documentsArr[i]._id}">
            <img src="/documentsImg/${documentsArr[i].documentImage}" >
            <div class="title">${documentsArr[i].title}</div>
            <div class="description"> ${documentsArr[i].description} </div>
            <div class="meta">
                <span class="likes">${likeDocument} Likes</span>
                <span class="date">${timeCreatedAgo}</span>
            </div>
        </div>   
        `
        documentContainer.innerHTML = documentHTML;
    }
}

//chưa dùng
function openDocument(documentId) {
    // Thực hiện hành động tương ứng để hiển thị hoặc tải tài liệu lên
    // Đặc biệt, nếu là tệp DOC, bạn cần sử dụng một thư viện hoặc plugin phù hợp để hiển thị nó
    console.log('Opening document with ID:', documentId);
    window.location.href = `http://localhost:3000/document/${documentId}`;
    fetch(`http://localhost:3000/api/document/${documentId}`, {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
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
        console.log("openDocument",result);

        // showDocuments(documentsArr);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

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

function timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
  
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) {
      return `${days} ngày trước`;
    } else if (hours > 0) {
      return `${hours} giờ trước`;
    } else if (minutes > 0) {
      return `${minutes} phút trước`;
    } else {
      return `${seconds} giây trước`;
    }
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