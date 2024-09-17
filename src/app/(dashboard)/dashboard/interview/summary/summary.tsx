"use client"
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export default function Summary() {
  const handleSave = () => {
    // Add save functionality here
    console.log('Save button clicked');
  };

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>
            This is the content for section 1. Add your summary or details here.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>
            This is the content for section 2. You can customize this text as needed.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Section 3</AccordionTrigger>
          <AccordionContent>
            Here&apos;s the content for section 3. Feel free to add more detailed information.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Section 4</AccordionTrigger>
          <AccordionContent>
            Section 4 content goes here. You can include any relevant details or summaries.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>Section 5</AccordionTrigger>
          <AccordionContent>
            And finally, this is the content for section 5. Customize as needed for your interview summary.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Button onClick={handleSave}>Save</Button>
    </div>
  );
}