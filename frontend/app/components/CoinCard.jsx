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
  message
} from "antd";
import dayjs from "dayjs";
import { tradeCoin, simulateBuy } from "@zoralabs/coins-sdk";
import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { parseEther } from "viem";
import { ExportOutlined } from "@ant-design/icons";
import { EXPLORER_URL } from "@/app/utils/constants";

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
    if (tradeCoinInput < 0) return message.error("Invalid trade amount");
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
        const simulateRes = await simulateBuy({
          target: coinDetails?.address,
          requestedOrderSize: parseEther(tradeCoinInput),
          publicClient
        });
        console.log("buy simulation res:", simulateRes);
        message.info(
          `You'll receive ${simulateRes?.amountOut} ${coinDetails?.symbol} for the requested order size of ${tradeCoinInput}`
        );
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
      title={coinDetails?.name || "Coin Details"}
      style={{ borderRadius: "20px" }}
      extra={
        <a
          href={`${EXPLORER_URL}/token/${coinDetails?.address}`}
          target="_blank"
          rel="noreferrer"
        >
          <ExportOutlined title="View on Etherscan" />
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
                prefix="$"
                precision={2}
              />
            )
          },
          {
            label: "Earnings",
            children: (
              <Statistic
                value={coinDetails?.earnings || 0}
                prefix="$"
                precision={2}
              />
            )
          },
          {
            label: "Holders",
            children: <Statistic value={coinDetails?.uniqueHolders || 0} />
          },
          {
            label: "Total Supply",
            children: <Statistic value={coinDetails?.totalSupply || 0} />
          }
        ]}
      />
      <Divider />
      {/* Buy/Sell Section */}
      <Space.Compact style={{ alignItems: "center" }}>
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
        <Input
          size="large"
          placeholder="Enter amount to buy/sell"
          type="number"
          min={1}
          onChange={(e) => setTradeCoinInput(e.target.value)}
          value={tradeCoinInput}
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
      <Divider />
      {/* Tabs Section */}
      <Tabs
        defaultActiveKey="comments"
        items={[
          {
            key: "comments",
            label: "Comments",
            children: <Empty description="No comments yet" />
          },
          {
            key: "holders",
            label: `Holders (${coinDetails?.uniqueHolders || 0})`,
            children: <Empty description="No holders yet" />
          },
          {
            key: "activity",
            label: "Activity",
            children: <Empty description="No activity yet" />
          },
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
                    children: coinDetails?.address || "-"
                  },
                  {
                    label: "Chain",
                    children: coinDetails?.chainId || "-"
                  },
                  {
                    label: "Creator",
                    children: coinDetails?.creatorAddress || "-"
                  },
                  {
                    label: "Created At",
                    // createdAt is in 2025-05-14T11:14:30 format
                    children: dayjs(coinDetails?.createdAt || 0).format(
                      "h:mm A MMM D, YYYY"
                    )
                  }
                  // Add more details as needed
                ]}
              />
            )
          }
        ]}
      />
    </Card>
  );
}
