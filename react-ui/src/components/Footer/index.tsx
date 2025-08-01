import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'DeepThinkAdmin',
          title: 'DeepThinkAdmin',
          href: 'https://pro.ant.design',
          blankTarget: false,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/cjy1998/my-links',
          blankTarget: true,
        },
        // {
        //   key: 'Ant Design',
        //   title: 'Ant Design',
        //   href: 'https://ant.design',
        //   blankTarget: false,
        // },
      ]}
    />
  );
};

export default Footer;
