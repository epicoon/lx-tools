let onEnterCallback = null;

let onEnter = function() {
	if (onEnterCallback) {
		if (onEnterCallback.isFunction) onEnterCallback();
		else if (onEnterCallback.isArray)
			onEnterCallback[1].call(onEnterCallback[0]);
	} 
	Snippet.widget.close();
};

let onEscape = function() {
	Snippet.widget.close();
};

Snippet.widget.open = function(message, callback) {
	this->stream->message.text(message);
	this->stream->message.height(
		this->stream->message->text.height('px') + 10 + 'px'
	);

	var top = (this.height('px') - this->stream.height('px')) * 0.5;
	if (top < 0) top = 0;
	this->stream.top(top + 'px');

	this.show();
	onEnterCallback = callback;
};

Snippet.widget.close = function() {
	this.hide();
	onEnterCallback = null;
};

Snippet->>yes.click(onEnter);
Snippet->>no.click(()=> Snippet.widget.close());
