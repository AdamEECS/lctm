var socket = io('http://' + document.domain + ':' + location.port);


var chatStore = {
    '大厅': [],
    '游戏': [],
    '灌水': [],
};

var initChatStore = function() {
  $('.rc-channel').map(function() {
    var channel = $(this).find("a").text();
    chatStore[channel] = [];
  })
}

var currentChannel = '大厅';

var log = function () {
    console.log.apply(console, arguments);
};

// 滚动到底部
var scrollToBottom = function (selector) {
    var height = $(selector).prop("scrollHeight");
    $(selector).animate({
        scrollTop: height
    }, 300);
};

var chatItemTemplate = function (chat) {
    var type = chat.type
    var name = chat.username;
    var avatar = chat.avatar;

    if (type == 'join') {
        var t = `
            <div>
                <img src="${avatar}"  height="10" width="10" class="avatar__image" alt="">
                <span>${name} 加入了聊天</span>
            </div>
        `
    } else {
        var content = chat.content;
        var time = chat.created_time;
        var t = `
        <div class="chat-item burstStart read burstFinal">
            <div class="chat-item__container">
                <div class="chat-item__aside">
                    <div class="chat-item__avatar">
                        <span class="widget">
                            <div class="trpDisplayPicture avatar-s">
                                <img src="${avatar}"  height="30" width="30" class="avatar__image" alt="">
                            </div>
                        </span>
                    </div>
                </div>
                <div class="chat-item__actions js-chat-item-actions">
                    <i class="chat-item__icon icon-check chat-item__icon--read chat-item__icon--read-by-some js-chat-item-readby"></i>
                    <i class="chat-item__icon icon-ellipsis"></i>
                </div>
                <div class="chat-item__content">
                    <div class="chat-item__details">
                        <div class="chat-item__from js-chat-item-from">${name}</div>
                        <a class="chat-item__time js-chat-time" href="#">
                            <time data-time="${time}"></time>
                        </a>
                    </div>
                    <div class="chat-item__text js-chat-item-text">${content}</div>
                </div>
            </div>
        </div>
        `;
      var staticFileURLPreix = location.origin + '/static/'
      var new_t = `<div class="chat-item">
                      <div class="user">
                          <div class="user-avatar"><img src="${staticFileURLPreix + avatar}" class="user-avatar"></div>
                          <div class="user-info">
                              <div class="user-name">${name}</div>
                              <div class="pass-time" href="#">
                                  <time data-time="${time}"></time>
                              </div>
                          </div>
                      </div>
                      <div class="user_content">
                          ${content}
                      </div>
                  </div>`
    }

    return new_t;
};

var insertChats = function (chats) {
    var selector = '#main'
    var chatsDiv = $(selector);
    var html = chats.map(chatItemTemplate);
    chatsDiv.append(html.join(''));
    scrollToBottom(selector);
};

var insertChatItem = function (chat) {
    var selector = '#main'
    var chatsDiv = $(selector);
    var t = chatItemTemplate(chat);
    chatsDiv.append(t);
    scrollToBottom(selector);
}

var chatResponse = function (r) {
    var chat = JSON.parse(r);
    try {
      chatStore[chat.channel].push(chat);
    }
    catch(err) {
      chatStore[chat.channel] = [];
      chatStore[chat.channel].push(chat);
    }
    if (chat.channel == currentChannel) {
        insertChatItem(chat);
    }
    // 添加浏览器 push
    let title = '收到新消息'
    let body = `<${chat.channel}>: ${chat.content}`
    Push.create(title, {
        body: body,
        icon: {
            x16: 'images/icon-x16.png',
            x32: 'images/icon-x32.png'
        },
        timeout: 10000
    })
};


var subscribe = function () {
    // var sse = new EventSource("/chat/subscribe");
    // sse.onmessage = function (e) {
    //     log(e, e.data);
    //     chatResponse(e.data);
    // };

    socket.on('message', function(data) {
      chatResponse(JSON.stringify(data));
    });
};

var sendMessage = function () {
    // var name = $('#id-input-name').val();
    var content = $('#id-input-content').val();
    var message = {
        // username: name,
        content: content,
        channel: currentChannel,
    };

    // var request = {
    //     url: '/chat/add',
    //     type: 'post',
    //     contentType: 'application/json',
    //     data: JSON.stringify(message),
    //     success: function (r) {
    //         log('success', r);
    //     },
    //     error: function (err) {
    //         log('error', err);
    //     }
    // };
    // $.ajax(request);

    // websocket
    // socket.emit('text', message);
    socket.emit('text', message);

};

var changeChannel = function (channel) {
    document.title = '聊天室 - ' + channel;
    currentChannel = channel;
};

var bindActions = function () {
    $('#id-button-send').on('click', function () {
        // $('#id-input-content').val();
        sendMessage();
        return false;
    });
    // 频道切换
    $('.rc-channel').on('click', 'a', function (e) {
        e.preventDefault();
        var channel = $(this).text();
        changeChannel(channel);
        // 切换显示
        $('.rc-channel').removeClass('active');
        $(this).addClass('active');
        // reload 信息
        $('#id-div-chats').empty();
        var chats = chatStore[currentChannel];
        insertChats(chats);
    })
};

// long time ago
var longTimeAgo = function () {
    var timeAgo = function (time, ago) {
        return Math.round(time) + ago;
    };

    $('time').each(function (i, e) {
        var past = parseInt(e.dataset.time);
        var now = Math.round(new Date().getTime() / 1000);
        var seconds = now - past;
        var ago = seconds / 60;
        // log('time ago', e, past, now, ago);
        var oneHour = 60;
        var oneDay = oneHour * 24;
        // var oneWeek = oneDay * 7;
        var oneMonth = oneDay * 30;
        var oneYear = oneMonth * 12;
        var s = '';
        if (seconds < 60) {
            s = timeAgo(seconds, ' 秒前')
        } else if (ago < oneHour) {
            s = timeAgo(ago, ' 分钟前');
        } else if (ago < oneDay) {
            s = timeAgo(ago / oneHour, ' 小时前');
        } else if (ago < oneMonth) {
            s = timeAgo(ago / oneDay, ' 天前');
        } else if (ago < oneYear) {
            s = timeAgo(ago / oneMonth, ' 月前');
        }
        $(e).text(s);
    });
};

var __main = function () {
    subscribe();
    bindActions();
    // 选中第一个 channel 作为默认 channel
    // $('.rc-channel')[0].click();
    currentChannel = $('.rc-channel').eq(0).find("a").text();
    initChatStore();
    // 更新时间的函数
    setInterval(function () {
        longTimeAgo();
    }, 1000);
};

$(document).ready(function () {
    __main();
});
