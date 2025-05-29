import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
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
import { tradeCoin, getCoin } from "@zoralabs/coins-sdk";
import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { parseEther } from "viem";
import { EXPLORER_URL } from "@/app/utils/constants";
import { abbreviateNumber } from "@/app/utils";
import Typography from "antd/es/typography/Typography";

export default function CoinCard({ coinAddress }) {
  const [coinDetails, setCoinDetails] = useState(null);
  const [coinDetailsLoading, setCoinDetailsLoading] = useState(true);
  const [tradeCoinInput, setTradeCoinInput] = useState(null);
  const [loading, setLoading] = useState({
    buy: false,
    sell: false
  });
  const { address: account } = useAccount();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: 84532 });

  const getCoinDetails = async () => {
    if (!coinAddress) return;
    setCoinDetailsLoading(true);
    message.info("Hang tight! Fetching coin details..");
    try {
      const res = await getCoin({
        address: coinAddress,
        chain: 84532 // base sepolia
      });
      console.log("Coin res:", res);
      const coin = res?.data?.zora20Token;
      setCoinDetails(coin);
      setCoinDetailsLoading(false);
    } catch (error) {
      setCoinDetailsLoading(false);
      console.error("Error fetching coin details:", error);
    }
  };

  const handleTradeCoin = async (direction) => {
    if (!coinDetails) return;
    if (!walletClient || !publicClient)
      return message.error("Please connect wallet first!");
    if (!tradeCoinInput || tradeCoinInput <= 0)
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
      const infoMessage =
        direction === "buy"
          ? `Bought coins worth ${tradeCoinInput} ETH successfully`
          : `Sold ${tradeCoinInput} coins successfully`;
      message.success(infoMessage);
      setLoading({ [direction]: false });
    } catch (error) {
      setLoading({ [direction]: false });
      console.error("Error trading coin:", error);
      message.error(
        `Failed to trade coin: ${error?.shortMessage || error?.message}`
      );
    }
  };

  useEffect(() => {
    getCoinDetails();
  }, [coinAddress]);

  return (
    <Card
      loading={coinDetailsLoading}
      hoverable
      variant="outlined"
      title={<Tag color="blue">{coinDetails?.name}</Tag>}
      style={{ borderRadius: "20px" }}
      actions={[<small style={{ color: "gray" }}>Powered by Zora</small>]}
      extra={
        <Space>
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
          <a
            title="View on Zora"
            href={`https://testnet.zora.co/coin/bsep:${coinDetails?.address}`}
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="https://zora.co/favicon.ico"
              style={{ cursor: "pointer" }}
              width={20}
              height={20}
              preview={false}
            />
          </a>
        </Space>
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
              <>
                <Space.Compact block>
                  <Input
                    size="large"
                    placeholder="Enter ETH amount to spend"
                    type="number"
                    min={1}
                    onChange={(e) => setTradeCoinInput(e.target.value)}
                    value={tradeCoinInput}
                    suffix="ETH"
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
                <Space
                  style={{
                    margin: "10px 0",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px"
                  }}
                >
                  {["0.001", "0.01", "0.05", "0.1", "0.5"].map((amount) => (
                    <Tag
                      key={amount}
                      style={{
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                      onClick={() => {
                        setTradeCoinInput(amount);
                      }}
                    >
                      {amount} ETH
                    </Tag>
                  ))}
                </Space>
              </>
            )
          },
          {
            key: "sell",
            label: (
              <Typography.Text style={{ color: "red" }}>Sell</Typography.Text>
            ),
            children: (
              <>
                <Space.Compact block>
                  <Input
                    value={tradeCoinInput}
                    size="large"
                    placeholder="Enter amount of coins to sell"
                    type="number"
                    min={1}
                    onChange={(e) => setTradeCoinInput(e.target.value)}
                    suffix={coinDetails?.symbol}
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
                <Space
                  style={{
                    margin: "10px 0",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px"
                  }}
                >
                  {[10, 25, 50, 75, 100].map((amount) => (
                    <Tag
                      key={amount}
                      style={{
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                      onClick={() => message.info("Feature coming soon!")}
                    >
                      {amount}%
                    </Tag>
                  ))}
                </Space>
              </>
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
