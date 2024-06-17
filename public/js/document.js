// var documentsArr = [];
// var usersArr = [];
// var likesArr = [];
// var postsArr = [];
// var currUser = {};
// var documentFileName = '';
// var imageFileName = '';
// const token = localStorage.getItem('jwtToken');
 
$(document).ready(function() {
    // //Lấy giá trị user
    // fetch('http://localhost:3000/api/users', {
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
    //     currUser = result.user;
    //     usersArr = result.users;
    //     const headerContainer = document.querySelector('.header-container');
    //         // Thêm giá trị vào thuộc tính data-user-id
    //     if (headerContainer) {
    //         headerContainer.dataset.userId = currUser._id;
    //     }
    //     // console.log("USER",result);
    //     // showUsers(usersArr);
    // })
    // .catch(error => {
    //     console.error('There was a problem with your fetch operation:', error);
    // });


    // //Lấy giá trị like
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
        // showSidebar(currUser);

        // var recentlyPostArr = documentsArr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
        var recentlyPostArr = documentsArr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        showDocumentSection(recentlyPostArr, 'recently-document-section')
        // showDocuments(documentsArr); recently-view-section
        // showMaybeInterestedSection(postsArr,likesArr, documentsArr);
        // showRecentlyViewSection(currUser, documentsArr);
        var maybeInterestedArr = getMaybeInterestedSection(postsArr,likesArr, documentsArr);
        showDocumentSection(maybeInterestedArr, 'maybe-interested-section')
        
        var recentlyViewArr = getRecentlyViewSection(currUser, documentsArr);
        showDocumentSection(recentlyViewArr, 'recently-view-section')
        
        
        console.log("recentlyViewArr",recentlyViewArr);
        console.log("maybeInterestedArr",maybeInterestedArr);

        
        
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
})

$(document).ready(function() {
    $(document).on('click','.recently-document-item img, .recently-document-item .title', async function(event) {
        event.stopPropagation();
        var documentId = $(this).closest('.recently-document-item').data('document-id');
        updateDocument(documentId);

        if(documentId){
            window.location.href = `http://localhost:3000/document/${documentId}`;
        }
    })
   
    $(document).on('click', '.maybe-interested-view-all', function(event) {
        event.stopPropagation();

        var maybeInterestedArr = getMaybeInterestedSection(postsArr,likesArr, documentsArr);
        console.log("maybeInterestedArr",maybeInterestedArr);
        showDocuments(maybeInterestedArr,'Có thể bạn quan tâm');
    })

    $(document).on('click', '.recently-view-view-all', function(event) {
        event.stopPropagation();

        var recentlyViewArr = getRecentlyViewSection(currUser, documentsArr);
        console.log("recentlyViewArr",recentlyViewArr)
        showDocuments(recentlyViewArr,'Đã xem gần đây');
    })

    $(document).on('click', '.recently-document-view-all', function(event) {
        event.stopPropagation();

        var recentlyPostArr = documentsArr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        showDocuments(recentlyPostArr,'Đã đăng gần đây');
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
