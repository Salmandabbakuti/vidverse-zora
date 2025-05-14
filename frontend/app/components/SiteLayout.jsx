"use client";
import { Divider, Layout } from "antd";
import { Button } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
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
        <appkit-button />
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
        <p style={{ fontSize: "12px" }}>v0.0.2</p>
      </Footer>
    </Layout>
  );
}
