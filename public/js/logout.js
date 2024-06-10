$(document).ready(function() {
    $(document).on('click', '#logout', function(event) {
        event.stopPropagation();
        var userId = $(this).closest('.header-container').data('user-id');
        console.log("logout userId", userId)
        if (confirm('Xác nhận đăng xuất')) {
            logout (userId);

            // localStorage.removeItem('jwtToken');
            window.location.href = 'http://localhost:3000/login-register';
        }
    })
});

function logout (userId){
    fetch('http://localhost:3000/api/logout', {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json",
        },
        body:JSON.stringify({userId: userId})
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
        console.log("result",result);
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