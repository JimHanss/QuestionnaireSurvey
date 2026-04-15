import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionCard } from './QuestionCard';
import { QuestionDefinition } from '../types';

const optionalQuestion: QuestionDefinition = {
  id: 'needsIntegration',
  sectionId: 'scope-shaping',
  type: 'radio',
  title: 'Will the product integrate with any third-party or internal systems?',
  helperText: 'Optional if discovery is still early.',
  required: false,
  skippable: true,
  options: [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' }
  ]
};

describe('QuestionCard', () => {
  it('renders skip affordance for optional questions and reports skip clicks', async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();

    render(
      <QuestionCard
        question={optionalQuestion}
        displayIndex={1}
        visibleCount={4}
        value=""
        skipped={false}
        onBlur={() => undefined}
        onChange={() => undefined}
        onSkip={onSkip}
      />
    );

    await user.click(screen.getByRole('button', { name: /skip for now/i }));

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('shows the validation message when the question has been touched', () => {
    render(
      <QuestionCard
        question={{ ...optionalQuestion, required: true, skippable: false }}
        displayIndex={2}
        visibleCount={4}
        value=""
        error="This question is required."
        touched
        skipped={false}
        onBlur={() => undefined}
        onChange={() => undefined}
        onSkip={() => undefined}
      />
    );

    expect(screen.getByText('This question is required.')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
