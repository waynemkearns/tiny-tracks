import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';
import { analytics, EventCategory } from '@/lib/analytics';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

export default function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('improvement');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: 'Message required',
        description: 'Please enter your feedback message',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Track the feedback submission in analytics
      analytics.trackEvent('feedback_submitted', EventCategory.Engagement, {
        feedbackType
      });
      
      // We'd typically send this to the server
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
      });
      
      // Reset form
      setMessage('');
      setIsOpen(false);
      
    } catch (error) {
      toast({
        title: 'Error submitting feedback',
        description: 'Please try again later',
        variant: 'destructive'
      });
      
      // Track error
      if (error instanceof Error) {
        analytics.trackError(error, { component: 'FeedbackForm' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg p-0 flex items-center justify-center"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-80 border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Share Feedback</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsOpen(false)}
        >
          ×
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="feedback-type">Feedback type</Label>
          <Select
            value={feedbackType}
            onValueChange={(value) => setFeedbackType(value as FeedbackType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">Bug report</SelectItem>
              <SelectItem value="feature">Feature request</SelectItem>
              <SelectItem value="improvement">Improvement suggestion</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="feedback-message">Message</Label>
          <Textarea
            id="feedback-message"
            placeholder="Tell us what's on your mind..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="feedback-email">
            Email (optional, for follow-up)
          </Label>
          <Input
            id="feedback-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </Button>
        </div>
      </form>
    </div>
  );
}
