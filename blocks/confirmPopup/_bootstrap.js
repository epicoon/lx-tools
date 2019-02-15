let onEnterCallback = null;

let onEnter = function() {
	if (onEnterCallback) {
		if (onEnterCallback.isFunction) onEnterCallback();
		else if (onEnterCallback.isArray)
			onEnterCallback[1].call(onEnterCallback[0]);
	} 
	Block.close();
};

let onEscape = function() {
	Block.close();
};

Block.open = function(message, callback) {
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

Block.close = function() {
	this.hide();
	onEnterCallback = null;
};

Block->>yes.click(onEnter);
Block->>no.click(()=> Block.close());
