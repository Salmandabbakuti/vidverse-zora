"use client";
import { UserOutlined } from "@ant-design/icons";
import { Divider, Layout, Button, Avatar, Badge, Input } from "antd";
import { PlayCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import Link from "next/link";
import UploadDrawer from "./UploadDrawer";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  const { address: account } = useAppKitAccount();
  const { open } = useAppKit();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "sticky",
          zIndex: 99,
          padding: 0,
          backgroundColor: "#ddd",
          color: "#000",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Link href="/">
          <div
            style={{
              display: "flex",
              fontWeight: "bold",
              alignItems: "center",
              gap: "3px",
              padding: "0 10px",
              cursor: "pointer"
            }}
          >
            <Button
              size="middle"
              icon={<PlayCircleOutlined />}
              type="primary"
              shape="circle"
              style={{ padding: 0 }}
            />
            <h3
              style={{
                margin: 0,
                padding: "0 6px",
                fontWeight: "bold"
              }}
            >
              VidVerse
            </h3>
          </div>
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 20px"
          }}
        >
          {/* Search Box */}
          <Input
            size="large"
            prefix={<SearchOutlined />}
            placeholder="Search"
            className="nav-search"
            style={{
              width: "100%",
              maxWidth: "600px",
              margin: "0 20px",
              borderRadius: "20px"
            }}
            onChange={(e) => {}}
          />
          <UploadDrawer />
          <Badge dot>
            <Avatar
              size={"large"}
              icon={account ? null : <UserOutlined />}
              src={
                account
                  ? `https://api.dicebear.com/5.x/open-peeps/svg?seed=${account}`
                  : null
              }
              onClick={() => open({ view: account ? "Account" : "Connect" })}
              style={{ cursor: "pointer", border: "1px solid #000" }}
            />
          </Badge>
        </div>
      </Header>

      <Content
        style={{
          margin: "12px 8px",
          padding: 12,
          minHeight: "100%",
          color: "black",
          maxHeight: "100%"
        }}
      >
        {children}
      </Content>
      <Divider plain />
      <Footer style={{ textAlign: "center" }}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          ©{new Date().getFullYear()} VidVerse. Powered by Zora Protocol & Reown
        </a>
        <p style={{ fontSize: "12px" }}>v0.1.0</p>
      </Footer>
    </Layout>
  );
}
