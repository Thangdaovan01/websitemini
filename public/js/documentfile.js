var documentFile = {};
var usersArr = [];
var likesArr = [];
var postsArr = [];
var currUser = {};
var documentsArr = [];

// const token = localStorage.getItem('jwtToken');

$(document).ready(function() {
    //Lấy giá trị like
    // fetch('http://localhost:3000/api/likes', {
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
    //     likesArr = result.likes;
    //     // console.log("LIKE",likesArr);
    // })
    // .catch(error => {
    //     console.error('There was a problem with your fetch operation:', error);
    // });

    // //Lấy giá trị posts
    // fetch('http://localhost:3000/api/posts', {
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
    //     const postsArr1 = result.posts;
    //     postsArr = postsArr1.filter(post => post.documentId && post.documentId.trim() !== '');
    // })
    // .catch(error => {
    //     console.error('There was a problem with your fetch operation:', error);
    // });

    //Lấy documentsArr
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
            console.log("USER",result);

            const headerContainer = document.querySelector('.header-container');
            // Thêm giá trị vào thuộc tính data-user-id
            if (headerContainer) {
            headerContainer.dataset.userId = currUser._id;
            }
            // showUsers(usersArr);
            // showSidebar(currUser);

            console.log("getDocumentsFILE");
            const path = window.location.pathname;
            const documentId = path.split('/').pop();
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
                documentFile = result.document;
                console.log("openDocument",documentFile);
        
                showDocument(documentFile);
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });

        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

    

    

})

$(document).ready(function() {
    // $(document).on('click', '.user-page', function(event) {
    //     event.stopPropagation();

    //     var userId = $(this).closest('.sidebar').data('user-id');
    //     window.location.href = 'http://localhost:3000/user?id='+userId;
    // })

    $(document).on('click', '.author-page', function(event) {
        event.stopPropagation();

        var userId = $(this).closest('.detail-info').data('user-id');
        window.location.href = 'http://localhost:3000/user?id='+userId;
    })

    $(document).on('click', '.subject-page', function(event) {
        event.stopPropagation();

        var subject = $(this).data('subject-value');
        console.log("subject",subject);
        const subjectArray = documentsArr.filter(object => object.subject == subject);
        showDocuments(subjectArray,`Tài liệu môn ${subject}`);
    })

    $(document).on('click', '.school-page', function(event) {
        event.stopPropagation();

        var school = $(this).data('school-value');
        console.log("school",school);
        // Cập nhật URL mà không tải lại trang
        history.pushState(null, '', '/document');
        const schoolArray = documentsArr.filter(object => object.school == school);
        showDocuments(schoolArray,`Tài liệu trường ${school}`);
    })

    // my-document-upload
    // $(document).on('click', '.my-document-upload', function(event) {
    //     event.stopPropagation();
    //     console.log("my-document-upload")
    //     var userId = $(this).closest('.sidebar').data('user-id');
    //     console.log("userId",userId);
    //     const myDocumentArr = documentsArr.filter(object => object.createdBy == userId);

    //     const user = usersArr.find(user => user._id === userId);
    //     const fullname = user ? user.fullname : null;
    //     // Cập nhật URL mà không tải lại trang
    //     history.pushState(null, '', '/document');
    //     showDocuments(myDocumentArr,`Tài liệu được đăng bởi ${fullname}`);
    // })

    // $(document).on('click','.recently-document-item img, .recently-document-item .title', async function(event) {
    //     event.stopPropagation();
    //     var documentId = $(this).closest('.recently-document-item').data('document-id');
    //     updateDocument(documentId);

    //     if(documentId){
    //         window.location.href = `http://localhost:3000/document/${documentId}`;
    //     }
    // })


})

// function updateDocument(documentId) {
//     console.log("UPDATE");

//     fetch('http://localhost:3000/api/document', {
//         method: "PUT",
//         headers: {
//             "Content-Type" : "application/json",
//             "Authorize" : token
//         },
//         body:JSON.stringify({documentId:documentId})
//     })
//     .then(response => {
//         return response.json().then(data => {
//             if (!response.ok) {
//                 showNotification(data.message);
//                 throw new Error('Network response was not ok');
//             }
//             return data;
//         });
//     })
//     .then(result => {
//         showNotification(result.message);
//         console.log("result",result)
//         // setTimeout(function() {
//         //     window.location.href = 'http://localhost:3000/';
//         // }, 500);
    
//     })
//     .catch(error => {
//         console.error('There was a problem with your fetch operation:', error);
//     });
// }

// function showDocuments(documentsArr, textContent) {
//     console.log("documentsArr", documentsArr); 
//     var documentsLength = documentsArr.length
//     const mainContent = document.querySelector('.file-container'); 
//     const mainContent1 = document.querySelector('.document-info-container'); 
//     const mainContent2 = document.querySelector('.main-content'); 
//     // Làm trống nội dung bên trong main-content
//     mainContent.innerHTML = '';
//     mainContent1.innerHTML = '';
//     mainContent.style.display = 'none';
//     mainContent1.style.display = 'none';
//     mainContent2.style.display = 'block';
//     // Tạo khối div mới với class section và documents-section
//     const sectionDiv = document.createElement('div');
//     sectionDiv.classList.add('section', 'documents-section');
//     // Tạo thẻ h3 với nội dung
//     const h3 = document.createElement('h3');
//     h3.textContent = `${textContent}`;
//     // Tạo khối div mới với class items và document-items
//     const itemsDiv = document.createElement('div');
//     itemsDiv.classList.add('items', 'document-items');
//     // Thêm thẻ h3 và khối itemsDiv vào sectionDiv
//     sectionDiv.appendChild(h3);
//     sectionDiv.appendChild(itemsDiv);
//     mainContent2.appendChild(sectionDiv);

//     const documentContainer = document.querySelector('.documents-section .items');
//     var documentHTML = ``;
//     for(let i = 0; i < documentsLength; i++) {
//         var timeCreatedAgo = timeAgo(documentsArr[i].createdAt);

//         const postDocument = postsArr.find(post => post.documentId === documentsArr[i]._id);
//         // console.log("postDocument",postDocument);
//         const likeDocument = likesArr.filter(like => like.likePostId === postDocument._id).length;

//         documentHTML += `
//         <div class="item recently-document-item recently-document-item-${documentsArr[i]._id}" data-document-id="${documentsArr[i]._id}">
//             <img src="/documentsImg/${documentsArr[i].documentImage}" >
//             <div class="title">${documentsArr[i].title}</div>
//             <div class="description"> ${documentsArr[i].description} </div>
//             <div class="meta">
//                 <span class="likes">${likeDocument} Likes</span>
//                 <span class="date">${timeCreatedAgo}</span>
//             </div>
//         </div>   
//         `
//         documentContainer.innerHTML = documentHTML;
//     }
// }

// function timeAgo(timestamp) {
//     const now = Date.now();
//     const diff = now - timestamp;
  
//     const seconds = Math.floor(diff / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const hours = Math.floor(minutes / 60);
//     const days = Math.floor(hours / 24);
  
//     if (days > 0) {
//       return `${days} ngày trước`;
//     } else if (hours > 0) {
//       return `${hours} giờ trước`;
//     } else if (minutes > 0) {
//       return `${minutes} phút trước`;
//     } else {
//       return `${seconds} giây trước`;
//     }
//   }

// function showSidebar(user) {
//     const userId = user._id;
//     const count = documentsArr.filter(doc => doc.createdBy === userId).length;
//     document.querySelector('.profile .username').textContent = user.fullname;
//     document.querySelector('.profile .uploadCount').textContent = `${count} Tải lên`;
//     const sidebar = document.querySelector('.sidebar');
//     sidebar.setAttribute('data-user-id', userId);
// }

function showDocument(documentFile) {
    // Lấy thẻ iframe bằng ID
    const documentHeader = document.querySelector('.file-container .document-header');
    var documentCreatedAt = convertTimestampToDateString(documentFile.createdAt);
    var documentHeaderHTML = `
        <span class="document-title">${documentFile.title}</span>
        <br>
        <span class="document-createdAt">Ngày tạo: ${documentCreatedAt}</span>
    `;
    documentHeader.innerHTML = documentHeaderHTML;
    const iframe = document.getElementById('file-iframe');
    const filePath = `/documents/${documentFile.document}`;
    iframe.src = filePath;

    var filteredUsers  = usersArr.filter(user => user._id == documentFile.createdBy);
    console.log("filteredUsers",filteredUsers);

    var authorName = filteredUsers[0].fullname;
    var authorId = filteredUsers[0]._id;
    const documentInfo = document.querySelector('.document-info-container');
    var documentInfoHTML = `
    <div class="detail-info" data-user-id="${authorId}">
        <h5>Thông tin chi tiết</h5>
        <p class="subject-page" data-subject-value="${documentFile.subject}"><strong>Môn học:</strong> ${documentFile.subject}</p>
        <p class="school-page" data-school-value="${documentFile.school}"><strong>Trường:</strong> ${documentFile.school}</p>
        <p class="author-page"><strong>Người tải lên:</strong> ${authorName}</p>
        <p><strong>Mô tả môn học:</strong> ${documentFile.description}</p>
    </div>
    `;
    documentInfo.innerHTML = documentInfoHTML;

}

function convertTimestampToDateString(timestamp) {
    const date = new Date(timestamp);
    
    // Lấy các thành phần của ngày tháng
    const day = date.getDate().toString().padStart(2, '0'); // Lấy ngày và thêm số 0 ở đầu nếu cần
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Lấy tháng và thêm số 0 ở đầu nếu cần
    const year = date.getFullYear();
    
    // Trả về chuỗi dạng ngày/tháng/năm
    return `${day}/${month}/${year}`;
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