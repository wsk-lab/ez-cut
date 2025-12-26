import React from 'react';
import { Watermark as AntWatermark } from 'antd';

interface WatermarkProps {
  children: React.ReactNode;
  visible?: boolean;
}

const Watermark: React.FC<WatermarkProps> = ({ 
  children, 
  visible = process.env.NODE_ENV === 'development' ? false : true 
}) => {
  if (!visible) return <>{children}</>;

  return (
    <AntWatermark
      content={['EZ CUT', 'WSK-Lab 出品']}
      gap={[200, 200]}
      offset={[100, 100]}
      font={{
        color: 'rgba(0, 0, 0, 0.1)',
        fontSize: 16,
        fontWeight: 'normal',
      }}
      rotate={-20}
      zIndex={1000}
    >
      {children}
    </AntWatermark>
  );
};

export default Watermark;
