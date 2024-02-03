class EventEmitService{
    static emitEventMethod(io, eventname, data) {
        io.emit(eventname, data);
    }
    

}
module.exports = EventEmitService