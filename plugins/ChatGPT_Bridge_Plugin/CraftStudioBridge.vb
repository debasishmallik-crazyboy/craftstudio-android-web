' ==============================================================================
' CraftStudio ChatGPT Generative AI Bridge Plugin (.DLL)
' Language: Visual Basic .NET (VB.NET) / Visual Studio Class Library
' Architecture: Reverse-engineered Canva-to-CraftStudio editable vector/raster pipeline
' Target: Visual Studio 2019 / 2022 / VS Code & CorelDRAW / Photoshop VSTA Host
' ==============================================================================

Imports System
Imports System.IO
Imports System.Net
Imports System.Text
Imports System.Diagnostics

Namespace CraftStudio.Plugins

    ''' <summary>
    ''' ChatGPT Plugin Bridge Class:
    ''' Handles bidirectional communication between ChatGPT Generative AI and CraftStudio
    ''' (DesignCraft, VectorCraft & PhotoCraft) for Android Tablet and Web.
    ''' </summary>
    Public Class ChatGPTPluginBridge

        ' Default endpoints: GitHub Pages (Global Free Hosting) and Local Wi-Fi Tablet Hub
        Private _cloudUrl As String = "https://debasishmallik-crazyboy.github.io/craftstudio-android-web/"
        Private _localTabletUrl As String = "http://192.168.1.3:3000/"

        Public Sub New()
            ' Default Constructor
        End Sub

        Public Sub New(customCloudUrl As String, customLocalUrl As String)
            If Not String.IsNullOrEmpty(customCloudUrl) Then _cloudUrl = customCloudUrl
            If Not String.IsNullOrEmpty(customLocalUrl) Then _localTabletUrl = customLocalUrl
        End Sub

        Public Property CloudUrl As String
            Get
                Return _cloudUrl
            End Get
            Set(value As String)
                _cloudUrl = value
            End Set
        End Property

        Public Property LocalTabletUrl As String
            Get
                Return _localTabletUrl
            End Get
            Set(value As String)
                _localTabletUrl = value
            End Set
        End Property

        ''' <summary>
        ''' Encodes a JSON design specification into a URL-safe Base64 payload and
        ''' generates a 1-click launch URL that opens directly in CraftStudio.
        ''' </summary>
        ''' <param name="jsonPayload">The layered design JSON string.</param>
        ''' <param name="useLocalTablet">True to use local Wi-Fi IP, False for GitHub Pages cloud.</param>
        ''' <returns>The complete launch URL with #design= payload.</returns>
        Public Function GenerateLaunchUrl(jsonPayload As String, Optional useLocalTablet As Boolean = False) As String
            If String.IsNullOrEmpty(jsonPayload) Then
                Throw New ArgumentNullException("jsonPayload", "JSON design payload cannot be empty.")
            End If

            ' 1. Convert UTF-8 string to bytes (Preserving Bengali and Unicode characters)
            Dim utf8Bytes As Byte() = Encoding.UTF8.GetBytes(jsonPayload)

            ' 2. Convert to Base64
            Dim base64String As String = Convert.ToBase64String(utf8Bytes)

            ' 3. Construct Deep-link URL
            Dim baseUrl As String = If(useLocalTablet, _localTabletUrl, _cloudUrl)
            If Not baseUrl.EndsWith("/") Then baseUrl &= "/"

            Return baseUrl & "#design=" & base64String
        End Function

        ''' <summary>
        ''' Decodes a Base64 design string received from ChatGPT or CraftStudio URL hash.
        ''' </summary>
        ''' <param name="base64Payload">Base64 encoded string.</param>
        ''' <returns>Original JSON design specification.</returns>
        Public Function DecodeDesignPayload(base64Payload As String) As String
            If String.IsNullOrEmpty(base64Payload) Then
                Throw New ArgumentNullException("base64Payload", "Base64 payload cannot be empty.")
            End If

            ' Clean URL hash prefix if present
            Dim cleanBase64 As String = base64Payload.Replace("#design=", "").Trim()

            Dim bytes As Byte() = Convert.FromBase64String(cleanBase64)
            Return Encoding.UTF8.GetString(bytes)
        End Function

        ''' <summary>
        ''' Automatically launches the design in the default web browser or sends to Android Tablet.
        ''' </summary>
        ''' <param name="jsonPayload">The design JSON string.</param>
        ''' <param name="useLocalTablet">True for local Wi-Fi tablet hub, False for cloud.</param>
        Public Sub LaunchInBrowser(jsonPayload As String, Optional useLocalTablet As Boolean = False)
            Dim url As String = GenerateLaunchUrl(jsonPayload, useLocalTablet)
            Process.Start(New ProcessStartInfo(url) With {.UseShellExecute = True})
        End Sub

        ''' <summary>
        ''' Generates a QR Code Image URL to scan with Android Tablet camera.
        ''' </summary>
        Public Function GetTabletQrCodeUrl(jsonPayload As String) As String
            Dim launchUrl As String = GenerateLaunchUrl(jsonPayload, True)
            Dim encodedUrl As String = Uri.EscapeDataString(launchUrl)
            Return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" & encodedUrl
        End Function

        ''' <summary>
        ''' Factory method: Generates a ready-to-use Medical Service Centre camp poster design JSON.
        ''' </summary>
        Public Function CreateMedicalCampDesign() As String
            Dim sb As New StringBuilder()
            sb.AppendLine("{")
            sb.AppendLine("  ""app"": ""craftstudio"",")
            sb.AppendLine("  ""version"": ""1.0"",")
            sb.AppendLine("  ""mode"": ""vector"",")
            sb.AppendLine("  ""title"": ""Medical Service Centre - Health Camp"",")
            sb.AppendLine("  ""canvas"": { ""width"": 1080, ""height"": 1350, ""background"": ""#0b192c"" },")
            sb.AppendLine("  ""layers"": [")
            sb.AppendLine("    { ""id"": ""head_box"", ""name"": ""Header Card"", ""type"": ""rect"", ""x"": 40, ""y"": 40, ""width"": 1000, ""height"": 250, ""radius"": 16, ""fill"": ""#1e3e62"", ""stroke"": ""#f59e0b"", ""strokeWidth"": 3 },")
            sb.AppendLine("    { ""id"": ""title"", ""name"": ""Title"", ""type"": ""text"", ""x"": 540, ""y"": 110, ""text"": ""MEDICAL SERVICE CENTRE"", ""fontFamily"": ""Georgia"", ""fontSize"": 42, ""fontWeight"": ""bold"", ""color"": ""#ffffff"", ""align"": ""center"" },")
            sb.AppendLine("    { ""id"": ""motto"", ""name"": ""Motto"", ""type"": ""text"", ""x"": 540, ""y"": 160, ""text"": ""HOLD HIGH THE NOBLE BANNER OF MEDICAL ETHICS"", ""fontFamily"": ""Georgia"", ""fontSize"": 20, ""fontWeight"": ""bold"", ""color"": ""#f87171"", ""align"": ""center"" },")
            sb.AppendLine("    { ""id"": ""camp"", ""name"": ""Camp Title"", ""type"": ""text"", ""x"": 540, ""y"": 235, ""text"": ""MEGA FREE HEALTH & EYE CHECK-UP CAMP"", ""fontFamily"": ""Georgia"", ""fontSize"": 34, ""fontWeight"": ""bold"", ""color"": ""#facc15"", ""align"": ""center"" },")
            sb.AppendLine("    { ""id"": ""date_pill"", ""name"": ""Date Pill"", ""type"": ""rect"", ""x"": 100, ""y"": 350, ""width"": 420, ""height"": 80, ""radius"": 40, ""fill"": ""#dc2626"" },")
            sb.AppendLine("    { ""id"": ""date_text"", ""name"": ""Date Text"", ""type"": ""text"", ""x"": 310, ""y"": 402, ""text"": ""📅 SUNDAY, 15 NOV 2026"", ""fontFamily"": ""Arial"", ""fontSize"": 24, ""fontWeight"": ""bold"", ""color"": ""#ffffff"", ""align"": ""center"" },")
            sb.AppendLine("    { ""id"": ""time_pill"", ""name"": ""Time Pill"", ""type"": ""rect"", ""x"": 560, ""y"": 350, ""width"": 420, ""height"": 80, ""radius"": 40, ""fill"": ""#0284c7"" },")
            sb.AppendLine("    { ""id"": ""time_text"", ""name"": ""Time Text"", ""type"": ""text"", ""x"": 770, ""y"": 402, ""text"": ""⏰ 9:00 AM TO 4:00 PM"", ""fontFamily"": ""Arial"", ""fontSize"": 24, ""fontWeight"": ""bold"", ""color"": ""#ffffff"", ""align"": ""center"" }")
            sb.AppendLine("  ]")
            sb.AppendLine("}")
            Return sb.ToString()
        End Function

    End Class

End Namespace
