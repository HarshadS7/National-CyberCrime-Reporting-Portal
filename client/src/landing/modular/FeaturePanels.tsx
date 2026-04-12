import React from 'react';
import OutreachPanel from './OutreachPanel';
import SchedulingPanel from './SchedulingPanel';

export default function FeaturePanels() {
  return (
    <section className="bg-cream py-[6rem] px-[3rem] grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
      <OutreachPanel />
      <SchedulingPanel />
    </section>
  );
}
