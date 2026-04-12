import React from 'react';
import { Calendar } from 'lucide-react';

type DateCell = {
  value: string;
  isMuted?: boolean;
  isSelected?: boolean;
};

type TimeSlot = {
  time: string;
  isSelected?: boolean;
};

export default function SchedulingPanel() {
  const dates: DateCell[] = [
    { value: '27', isMuted: true }, { value: '28', isMuted: true }, { value: '1' },
    { value: '5' }, { value: '6' }, { value: '7' },
    { value: '12' }, { value: '13' }, { value: '14' },
    { value: '19' }, { value: '20', isSelected: true }, { value: '21' },
    { value: '26' }, { value: '27', isMuted: true }, { value: '28', isMuted: true },
  ];

  const timeSlots: TimeSlot[] = [
    { time: '09:00' },
    { time: '09:30' },
    { time: '10:00', isSelected: true },
    { time: '10:30', isSelected: true },
    { time: '11:00' },
    { time: '11:30' },
    { time: '12:00' },
  ];

  return (
    <div className="bg-[#F5F2E8] border border-[#EDE9D8] rounded-[12px] p-10">
      {/* Feature Tag */}
      <div className="flex gap-[0.4rem] items-center text-[#1A5C35] font-mono text-[0.65rem] uppercase tracking-[0.1em] mb-6">
        <Calendar className="w-3.5 h-3.5" />
        <span>Precision scheduling</span>
      </div>

      {/* Heading */}
      <h3 className="font-heading font-bold text-[1.5rem] leading-[1.25] text-[#1A1A18] mb-8">
        Timezone-aware scheduling,
        <br />
        always at peak open times.
      </h3>

      {/* Calendar Area */}
      <div className="flex gap-3">
        {/* Left Sub-block: Calendar */}
        <div className="flex-1 bg-[#0E0E0C] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-3">
          <div className="flex justify-end mb-2 text-[0.75rem] text-[rgba(255,255,255,0.4)] font-sans cursor-pointer hover:text-white transition-colors">
            ›
          </div>
          
          <div className="grid grid-cols-3 mb-[0.3rem]">
            <div className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.25)] text-center">Th</div>
            <div className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.25)] text-center">Fr</div>
            <div className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.25)] text-center">Sa</div>
          </div>
          
          <div className="grid grid-cols-3 gap-y-1 gap-x-1">
            {dates.map((d, i) => {
              let classes = "font-sans text-[0.7rem] text-center p-[0.25rem] rounded-[4px] ";
              if (d.isSelected) {
                classes += "bg-[rgba(255,255,255,0.1)] text-white font-medium ";
              } else if (d.isMuted) {
                classes += "text-[rgba(255,255,255,0.2)] ";
              } else {
                classes += "text-[rgba(255,255,255,0.45)] ";
              }
              
              return (
                <div key={i} className={classes}>
                  {d.value}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sub-block: Timeslots */}
        <div className="flex-1 bg-[#0E0E0C] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-3 flex flex-col gap-[0.3rem]">
          <div className="font-mono text-[0.68rem] font-medium text-[rgba(255,255,255,0.5)] mb-[0.5rem]">
            Tue, 20 — IST
          </div>
          
          {timeSlots.map((ts, i) => (
            <div 
              key={i} 
              className={`font-mono text-[0.7rem] text-center py-[0.35rem] px-[0.75rem] rounded-[5px] whitespace-nowrap border ${
                ts.isSelected 
                  ? 'bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)] text-white' 
                  : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.45)]'
              }`}
            >
              {ts.time}
            </div>
          ))}
        </div>
      </div>

      {/* Post-block: Touch-stages */}
      <div className="flex flex-row gap-[0.75rem] mt-4">
        {/* Touch 1 */}
        <div className="flex-1 bg-[#f7fddb] border border-[#EDE9D8] rounded-[8px] px-4 py-3 text-center">
          <div className="w-[36px] h-[36px] border-[1.5px] border-[#EDE9D8] rounded-full mx-auto flex items-center justify-center mb-2 text-[#6B6B62] font-mono text-[0.7rem]">
            1
          </div>
          <div className="font-sans text-[0.7rem] text-[#6B6B62]">Touch 1</div>
        </div>
        
        {/* Touch 2 */}
        <div className="flex-1 bg-[#f7fddb] border border-[#EDE9D8] rounded-[8px] px-4 py-3 text-center">
          <div className="w-[36px] h-[36px] border-[1.5px] border-[#EDE9D8] rounded-full mx-auto flex items-center justify-center mb-2 text-[#6B6B62] font-mono text-[0.7rem]">
            2
          </div>
          <div className="font-sans text-[0.7rem] text-[#6B6B62]">Touch 2</div>
        </div>
        
        {/* Active Session */}
        <div className="flex-1 bg-[#f7fddb] border border-[#EDE9D8] rounded-[8px] px-4 py-3 text-center">
          <div className="w-[36px] h-[36px] border-[1.5px] border-[#3E9B63] bg-[rgba(62,155,99,0.08)] rounded-full mx-auto flex items-center justify-center mb-2 text-[#1A5C35] font-mono text-[0.7rem] shadow-[0_0_8px_rgba(62,155,99,0.2)]">
            3
          </div>
          <div className="font-sans text-[0.7rem] text-[#1A5C35] font-medium">Active</div>
        </div>
        
        {/* Closed */}
        <div className="flex-1 bg-[#f7fddb] border border-[#EDE9D8] rounded-[8px] px-4 py-3 text-center text-[#B4B2A9]">
          <div className="w-[36px] h-[36px] border-[1.5px] border-[#EDE9D8] rounded-full mx-auto flex items-center justify-center mb-2 text-[#B4B2A9] font-mono text-[0.7rem] opacity-70">
            x
          </div>
          <div className="font-sans text-[0.7rem] text-[#B4B2A9]">Closed</div>
        </div>
      </div>
    </div>
  );
}
