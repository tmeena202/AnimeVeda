import '../styles/ScheduleNav.css';

export default function ScheduleNav({ weekdays, scheduleDay, setScheduleDay }) {
  return (
    <div className="schedule-nav">
       {weekdays.map((day) => (
         <button
           key={day}
           className={`schedule-day-btn ${scheduleDay === day ? 'active' : ''}`}
           onClick={() => setScheduleDay(day)}
         >
           {day}
         </button>
       ))}
    </div>
  );
}
