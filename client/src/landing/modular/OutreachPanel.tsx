import React from 'react';
import { LayoutGrid } from 'lucide-react';

type RowData = {
  status: string;
  statusDot: string;
  email: string;
  channel: string;
  rowBg?: string;
  isFaded?: boolean;
};

export default function OutreachPanel() {
  const rows: RowData[] = [
    {
      status: 'Sent',
      statusDot: 'bg-[#3E9B63]',
      email: 'rahul@acme.in',
      channel: 'LinkedIn DM',
    },
    {
      status: 'Sent',
      statusDot: 'bg-[#3E9B63]',
      email: 'priya@scale.io',
      channel: 'Email',
    },
    {
      status: 'Live',
      statusDot: 'bg-[#6B8EF0]',
      email: 'arjun@velo.com',
      channel: 'WhatsApp',
      rowBg: 'bg-[rgba(107,142,240,0.07)]',
    },
    {
      status: 'Queued',
      statusDot: 'bg-[rgba(255,255,255,0.2)]',
      email: 'neha@fin.ai',
      channel: 'LinkedIn DM',
      isFaded: true,
    },
  ];

  return (
    <div className="bg-[#F5F2E8] border border-[#EDE9D8] rounded-[12px] p-10">
      {/* Feature Tag */}
      <div className="flex gap-[0.4rem] items-center text-[#1A5C35] font-mono text-[0.65rem] uppercase tracking-[0.1em] mb-4">
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Multi-channel delivery</span>
      </div>

      {/* Heading */}
      <h3 className="font-heading font-bold text-[1.5rem] leading-[1.25] text-[#1A1A18] mb-8">
        Advanced delivery engine,
        <br />
        reaches every lead everywhere.
      </h3>

      {/* Table Mockup */}
      <div className="bg-[#0E0E0C] border border-[rgba(255,255,255,0.08)] rounded-[8px] overflow-hidden relative flex flex-col">
        
        {/* Header Block */}
        <div className="py-3 px-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="font-sans font-medium text-[0.85rem] text-white">Outreach Activity</div>
          <div className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.3)]">Manage your campaigns.</div>
        </div>

        {/* Filter Row */}
        <div className="py-2 px-4 flex justify-between border-b border-[rgba(255,255,255,0.06)] bg-black/20">
          <input
            type="text"
            readOnly
            value="Filter by channel..."
            className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-[4px] px-[0.6rem] py-[0.3rem] font-sans text-[0.7rem] text-[rgba(255,255,255,0.35)] w-[160px] outline-none"
          />
          <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-[4px] px-[0.6rem] py-[0.3rem] font-sans text-[0.7rem] text-[rgba(255,255,255,0.35)] cursor-pointer">
            Columns ▾
          </button>
        </div>

        {/* Table Area */}
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.3)] px-4 py-2 text-left font-normal border-b border-[rgba(255,255,255,0.06)]">
                Status
              </th>
              <th className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.3)] px-4 py-2 text-left font-normal border-b border-[rgba(255,255,255,0.06)]">
                Lead
              </th>
              <th className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.3)] px-4 py-2 text-left font-normal border-b border-[rgba(255,255,255,0.06)]">
                Channel
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className={row.rowBg || ''}>
                <td className={`font-sans text-[0.73rem] px-4 py-[0.55rem] border-b border-[rgba(255,255,255,0.03)] ${row.isFaded ? 'text-[rgba(255,255,255,0.25)]' : 'text-[rgba(255,255,255,0.6)]'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-[6px] h-[6px] rounded-full ${row.statusDot}`}></span>
                    {row.status}
                  </div>
                </td>
                <td className={`font-sans text-[0.73rem] px-4 py-[0.55rem] border-b border-[rgba(255,255,255,0.03)] ${row.isFaded ? 'text-[rgba(255,255,255,0.25)]' : 'text-[rgba(255,255,255,0.6)]'}`}>
                  {row.email}
                </td>
                <td className={`font-sans text-[0.73rem] px-4 py-[0.55rem] border-b border-[rgba(255,255,255,0.03)] ${row.isFaded ? 'text-[rgba(255,255,255,0.25)]' : 'text-[rgba(255,255,255,0.6)]'}`}>
                  {row.channel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom Decorative Gradient */}
        <div className="h-[40px] bg-gradient-to-t from-[rgba(20,80,200,0.25)] to-transparent pointer-events-none mt-auto" />
      </div>
    </div>
  );
}
