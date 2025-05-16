import { useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Input,
  Space,
  Statistic,
  Tabs,
  message,
  Image,
  Tag
} from "antd";
import dayjs from "dayjs";
import { tradeCoin, simulateBuy } from "@zoralabs/coins-sdk";
import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { parseEther } from "viem";
import { EXPLORER_URL } from "@/app/utils/constants";
import { abbreviateNumber } from "@/app/utils";
import Typography from "antd/es/typography/Typography";

export default function CoinCard({ coinDetails = {} }) {
  const [tradeCoinInput, setTradeCoinInput] = useState(0);
  const [loading, setLoading] = useState({
    buy: false,
    sell: false
  });
  const { address: account } = useAccount();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: 84532 });
  console.log("Wallet client:", walletClient);
  console.log("Public client:", publicClient);

  const handleTradeCoin = async (direction) => {
    if (!coinDetails) return;
    if (!walletClient || !publicClient)
      return message.error("Please connect wallet first!");
    if (tradeCoinInput <= 0)
      return message.error("Enter a valid amount to trade");
    setLoading({ [direction]: true });
    try {
      const tradeParams = {
        direction,
        target: coinDetails?.address,
        args: {
          recipient: account, // Address to receive the coins
          orderSize: parseEther(tradeCoinInput), // Amount of coins to sell
          minAmountOut: 0n,
          tradeReferrer: account // Address to receive the referral
        }
      };
      console.log("Trade params:", tradeParams);
      // if direction buy, simulate buy
      if (direction === "buy") {
        // const simulateRes = await simulateBuy({
        //   target: coinDetails?.address,
        //   requestedOrderSize: parseEther(tradeCoinInput),
        //   publicClient
        // });
        // console.log("buy simulation res:", simulateRes);
        // message.info(
        //   `You'll receive ${simulateRes?.amountOut} ${coinDetails?.symbol} for the requested order size of ${tradeCoinInput}`
        // );
      }
      const res = await tradeCoin(tradeParams, walletClient, publicClient);
      console.log("Trade coin res:", res);
      message.success("Coin traded successfully");
      setLoading({ [direction]: false });
    } catch (error) {
      setLoading({ [direction]: false });
      console.error("Error trading coin:", error);
      message.error(
        `Failed to trade coin: ${error?.shortMessage || error?.message}`
      );
    }
  };

  return (
    <Card
      title={<Tag color="blue">{coinDetails?.name}</Tag>}
      style={{ borderRadius: "20px" }}
      actions={[<small style={{ color: "gray" }}>Powered by Zora</small>]}
      extra={
        <a
          title="View on Basescan"
          href={`${EXPLORER_URL}/token/${coinDetails?.address}`}
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src="https://etherscan.io/favicon.ico"
            style={{ cursor: "pointer" }}
            width={20}
            height={20}
            preview={false}
          />
        </a>
      }
    >
      {/* Coin Statistics */}
      <Descriptions
        layout="vertical"
        column={2}
        colon={false}
        size="small"
        items={[
          {
            label: "Market Cap",
            children: (
              <Statistic
                value={coinDetails?.marketCap || 0}
                valueStyle={{
                  color: "#1890ff",
                  fontWeight: "bold"
                }}
                prefix="$"
                precision={2}
              />
            )
          },
          {
            label: "Volume (24h)",
            children: (
              <Statistic
                value={coinDetails?.volume24h || 0}
                valueStyle={{
                  color: "#52c41a",
                  fontWeight: "bold"
                }}
                prefix="$"
                precision={2}
              />
            )
          },
          {
            label: "Total Vol",
            children: (
              <Statistic
                value={coinDetails?.totalVolume || 0}
                valueStyle={{
                  color: "#3f8600",
                  fontWeight: "bold"
                }}
                prefix="$"
                precision={2}
              />
            )
          },
          {
            label: "Earnings",
            children: (
              <Statistic
                value={coinDetails?.creatorEarnings?.[0]?.amountUsd || 0}
                valueStyle={{
                  color: "#faad14",
                  fontWeight: "bold"
                }}
                prefix="$"
                precision={2}
              />
            )
          },
          {
            label: "Holders",
            children: (
              <Statistic
                valueStyle={{
                  fontWeight: "bold"
                }}
                value={coinDetails?.uniqueHolders || 0}
              />
            )
          },
          {
            label: "Total Supply",
            children: (
              <Statistic
                formatter={abbreviateNumber}
                valueStyle={{
                  color: "#ff4d4f",
                  fontWeight: "bold"
                }}
                value={coinDetails?.totalSupply || 0}
              />
            )
          }
        ]}
      />
      {/* Buy/Sell Section */}
      <Tabs
        defaultActiveKey="buy"
        animated
        // type="card"
        items={[
          {
            key: "buy",
            label: (
              <Typography.Text style={{ color: "#02bf76" }}>
                Buy
              </Typography.Text>
            ),
            children: (
              <Space.Compact block>
                <Input
                  size="large"
                  placeholder="Enter ETH amount to spend"
                  type="number"
                  min={1}
                  onChange={(e) => setTradeCoinInput(e.target.value)}
                  value={tradeCoinInput}
                />
                <Button
                  variant="solid"
                  shape="round"
                  size="large"
                  style={{
                    backgroundColor: "#02bf76",
                    color: "white"
                  }}
                  loading={loading?.buy}
                  onClick={() => handleTradeCoin("buy")}
                >
                  Buy
                </Button>
              </Space.Compact>
            )
          },
          {
            key: "sell",
            label: (
              <Typography.Text style={{ color: "red" }}>Sell</Typography.Text>
            ),
            children: (
              <Space.Compact block>
                <Input
                  value={tradeCoinInput}
                  size="large"
                  placeholder="Enter amount of coins to sell"
                  type="number"
                  min={1}
                  onChange={(e) => setTradeCoinInput(e.target.value)}
                />
                <Button
                  color="red"
                  variant="solid"
                  shape="round"
                  size="large"
                  loading={loading?.sell}
                  onClick={() => handleTradeCoin("sell")}
                >
                  Sell
                </Button>
              </Space.Compact>
            )
          }
        ]}
      />
      {/* Tabs Section */}
      <Tabs
        defaultActiveKey="details"
        items={[
          {
            key: "details",
            label: "Details",
            children: (
              <Descriptions
                column={1}
                colon={false}
                size="large"
                items={[
                  {
                    label: "Name",
                    children: coinDetails?.name || "-"
                  },
                  {
                    label: "Symbol",
                    children: coinDetails?.symbol || "-"
                  },
                  {
                    label: "Address",
                    children: (
                      <a
                        href={`${EXPLORER_URL}/token/${coinDetails?.address}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {coinDetails?.address || "-"}
                      </a>
                    )
                  },
                  {
                    label: "Chain",
                    children: coinDetails?.chainId || "-"
                  },
                  {
                    label: "Creator",
                    children: (
                      <a
                        href={`${EXPLORER_URL}/token/${coinDetails?.creatorAddress}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {coinDetails?.creatorAddress || "-"}
                      </a>
                    )
                  },
                  {
                    label: "Created At",
                    // createdAt is in 2025-05-14T11:14:30 format
                    children: coinDetails?.createdAt
                      ? dayjs(coinDetails?.createdAt || 0).format(
                          "MMM D, YYYY, h:mm A"
                        )
                      : "-"
                  }
                ]}
              />
            )
          },
          {
            key: "comments",
            label: "Comments",
            children: <Empty description="Comments coming soon" />
          },
          {
            key: "holders",
            label: `Holders (${coinDetails?.uniqueHolders || 0})`,
            children: <Empty description="Holders list coming soon" />
          },
          {
            key: "activity",
            label: "Activity",
            children: <Empty description="Activity coming soon" />
          }
        ]}
      />
    </Card>
  );
}
