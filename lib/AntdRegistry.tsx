'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';

export default function AntdRegistryProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: '#6366f1',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            colorInfo: '#3b82f6',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
          components: {
            Layout: {
              headerBg: '#ffffff',
              siderBg: '#ffffff',
              bodyBg: '#f8fafc',
            },
            Card: {
              borderRadiusLG: 12,
              boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
            },
            Button: {
              borderRadius: 8,
              controlHeight: 38,
              fontWeight: 500,
            },
            Input: {
              borderRadius: 8,
              controlHeight: 38,
            },
            Select: {
              borderRadius: 8,
              controlHeight: 38,
            },
            Table: {
              borderRadiusLG: 12,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
