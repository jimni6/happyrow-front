import React from 'react';

// Clean test file to verify pre-commit hook works correctly

interface TestProps {
  name: string;
  age?: number;
}

const TestPrecommit: React.FC<TestProps> = ({ name, age }) => {
  return (
    <div style={{ color: 'blue', fontSize: '18px' }}>
      <h1>Hello {name}!</h1>
      <p>Age: {age ?? 'Not specified'}</p>
    </div>
  );
};

export default TestPrecommit;
