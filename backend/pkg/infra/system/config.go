package system

// Config system config
type Config struct {
	FrontendURLs []string
}

// NewConf return system config
func NewConf() *Config {
	return &Config{
		// TODO: 環境変数から注入する
		FrontendURLs: []string{
			"http://localhost:3000",
			"http://miniapp.demo.lycle-line.jp.s3-website-ap-northeast-1.amazonaws.com",
		},
	}
}
