

export interface TimerId{
    id:string;
    started: number;
    timeout: number;
}

enum TIMER_STATUS {
    WAITING = "waiting",
    PAUSE = "pause"
}

interface TimerData extends TimerId {
    cb: (...args: any[]) => void;
    timeout_id?: NodeJS.Timeout,
    status: TIMER_STATUS,
    resume_time: number;
}

export interface ITimer {
    runTimer(value:number, cb: (...args: any[]) => void):TimerId;

    pause(timerId:TimerId):void;

    resume(timerId:TimerId):void;

    delete(timerId:TimerId):void;
}

class Timer implements ITimer {
    
    constructor(
        private readonly _timers:Record<string, TimerData> = {}
    ){}

    private generateId():string {
        return `${Date.now()}-${Math.floor(Math.random() * 10000)}`; 
    }

    runTimer(value: number, cb: (...args: any[]) => void): TimerId {
        const data:TimerData = {
            cb,
            status: TIMER_STATUS.WAITING,
            id: this.generateId(),
            started: Date.now(),
            timeout: value,
            resume_time: 0
        }

        //data.timeout_id = setTimeout(this.onTimeOut.bind(this), data.timeout, data);
        this.startTimeout(data, data.timeout);
        this._timers[data.id] = data;
        return data;    // TODO: toTimerId();
    }

    pause(timerId: TimerId): void {
        const timerData:TimerData = this._timers[timerId.id];
        clearTimeout(timerData.timeout_id);
        timerData.resume_time = Date.now() - timerData.started;
        timerData.status = TIMER_STATUS.PAUSE;
    }

    resume(timerId: TimerId): void {
        const timerData:TimerData = this._timers[timerId.id];

        const time_remaining = timerData.timeout - timerData.resume_time;
        this.startTimeout(timerData, time_remaining);
    }

    delete(timerId: TimerId): void {
        delete this._timers[timerId.id];
    }



    private onTimeOut(data:TimerData) {
        clearTimeout(data.timeout_id);

        data.cb();

        this.delete(data);
    }

    private startTimeout(data:TimerData, time:number):void {
        data.timeout_id = setTimeout(this.onTimeOut.bind(this), time, data);
    } 
}


export default new Timer() as ITimer;